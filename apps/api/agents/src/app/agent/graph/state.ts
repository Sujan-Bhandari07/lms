import {Annotation,MessagesAnnotation} from '@langchain/langgraph'

type StateType = typeof state.State
const state = Annotation.Root({
    ...MessagesAnnotation.spec,
    prompt:Annotation<string>(),
    response:Annotation<string>(),






})

export {state,StateType}