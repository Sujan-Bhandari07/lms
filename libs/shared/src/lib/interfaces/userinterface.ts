

interface IRegister{
    fullname:string
    email:string
    password:string
    role:"student" | "tutor"
}

type ILogin = Pick<IRegister,"email"| "password">



type UpdateUser = Partial<Pick<IRegister,"fullname"|"password">>
interface IUpdateUser extends UpdateUser{
    profile?:string,
    token:string
}

export {IRegister,ILogin,IUpdateUser}