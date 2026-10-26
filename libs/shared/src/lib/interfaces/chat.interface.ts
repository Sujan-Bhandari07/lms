interface IUser{
    userid:string
    username:string
}

export interface ISendMessage{

    message:string
    sender:IUser
    receiver:IUser

}

export interface IGetConversation{
    sender:string
    receiver:string
}