import { Logger, CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { ClientProxy, RmqContext } from "@nestjs/microservices";
import { Observable, catchError, tap, throwError } from "rxjs";

type RmqPattern = string | Record<string, unknown>;

export function sanitizeDiagnosticText(value: string | undefined): string | undefined {
  return value
    ?.replace(
      /\b(amqps?|https?|mongodb(?:\+srv)?|redis):\/\/[^@\s/]+@/gi,
      "$1://[REDACTED]@",
    )
    .replace(
      /\b(password|passwd|token|cookie|authorization|api[_-]?key)\b(\s*[:=]\s*)(?:"[^"]*"|'[^']*'|[^\s,;]+)/gi,
      "$1$2[REDACTED]",
    )
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*/gi, "Bearer [REDACTED]")
    .replace(/\b(set-cookie|cookie|authorization)\s*:\s*[^\r\n]*/gi, "$1: [REDACTED]");
}

export function exceptionResponseMessage(
  response: string | object,
): string | undefined {
  if (typeof response === "string") {
    return response;
  }
  if (!("message" in response)) {
    return undefined;
  }

  const { message } = response;
  if (typeof message === "string") {
    return message;
  }
  return Array.isArray(message)
    ? message.map((item) => String(item)).join(", ")
    : undefined;
}

function patternName(pattern: RmqPattern): string {
  return typeof pattern === "string" ? pattern : JSON.stringify(pattern);
}

function errorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      errorName: error.name,
      errorMessage: sanitizeDiagnosticText(error.message),
      stack: sanitizeDiagnosticText(error.stack),
    };
  }
  if (error !== null && typeof error === "object") {
    const details = error as Record<string, unknown>;
    return {
      errorName:
        typeof details.name === "string" ? details.name : "RemoteServiceError",
      errorMessage: sanitizeDiagnosticText(
        typeof details.message === "string"
          ? details.message
          : String(error),
      ),
      stack:
        typeof details.stack === "string"
          ? sanitizeDiagnosticText(details.stack)
          : undefined,
    };
  }
  return {
    errorName: "UnknownError",
    errorMessage: sanitizeDiagnosticText(String(error)),
  };
}

@Injectable()
export class RmqDiagnosticsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(RmqDiagnosticsInterceptor.name);

  constructor(private readonly service: string) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const rmqContext = context.switchToRpc().getContext<RmqContext>();
    const pattern = patternName(rmqContext.getPattern() as RmqPattern);
    const startedAt = Date.now();
    const log = (event: string, details: Record<string, unknown> = {}) =>
      this.logger.log(
        JSON.stringify({
          event: `rmq.handler.${event}`,
          service: this.service,
          pattern,
          durationMs: Date.now() - startedAt,
          ...details,
        }),
      );

    log("received");
    return next.handle().pipe(
      tap({
        next: () => log("response"),
        complete: () => log("completed"),
      }),
      catchError((error: unknown) => {
        this.logger.error(
          JSON.stringify({
            event: "rmq.handler.error",
            service: this.service,
            pattern,
            durationMs: Date.now() - startedAt,
            ...errorDetails(error),
          }),
        );
        return throwError(() => error);
      }),
    );
  }
}

export function instrumentRmqClient<T extends ClientProxy>(
  client: T,
  service: string,
): T {
  const logger = new Logger("RmqClientDiagnostics");
  return new Proxy(client, {
    get(target, property) {
      if (property === "send" || property === "emit") {
        return (pattern: RmqPattern, payload: unknown) => {
          const patternText = patternName(pattern);
          const startedAt = Date.now();
          const log = (event: string, details: Record<string, unknown> = {}) =>
            logger.log(
              JSON.stringify({
                event: `rmq.request.${event}`,
                service,
                pattern: patternText,
                operation: property,
                durationMs: Date.now() - startedAt,
                ...details,
              }),
            );

          log("sent");
          const response = Reflect.apply(target[property], target, [
            pattern,
            payload,
          ]) as Observable<unknown>;
          return response.pipe(
            tap({
              next: () => log("response"),
              complete: () => log("completed"),
              error: (error: unknown) =>
                logger.error(
                  JSON.stringify({
                    event: "rmq.request.error",
                    service,
                    pattern: patternText,
                    operation: property,
                    durationMs: Date.now() - startedAt,
                    ...errorDetails(error),
                  }),
                ),
            }),
          );
        };
      }

      const value = Reflect.get(target, property, target) as unknown;
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
