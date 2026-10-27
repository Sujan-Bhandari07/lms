import {Annotation,MessagesAnnotation} from '@langchain/langgraph'

type A =  "general" | "tools" | "other" | "website";


type StateType = typeof state.State
const state = Annotation.Root({
    ...MessagesAnnotation.spec,
    prompt:Annotation<string>(),
    response:Annotation<string>(),
    type:Annotation<A>()






})

export {state,StateType}