

interface IRegister{
    fullname:string
    email:string
    password:string
    role:"student" | "tutor"
    profilepic?:string | null
}

type ILogin = Pick<IRegister,"email"| "password">



type UpdateUser = Partial<Pick<IRegister,"fullname"|"password">>
interface IUpdateUser extends UpdateUser{
    profile?:string,
    token:string
}

interface ICreateCertificate{
    coursename:string,
    tutor:string
    studentid:string
    courseid:string
}

type IUpdateEnrolledCourse=ICreateCertificate
interface IUpdateTutor {
    experience:string,
    userid:string,
    acedemics:string
}

interface IverifyTutor{
    userid:string
    decision?:"approve" | "reject"

}



interface ICompleteCourse{
    courseid:string,
    studentid:string
}



export {IRegister,IverifyTutor,ICompleteCourse,IUpdateTutor,ILogin,IUpdateUser,ICreateCertificate,IUpdateEnrolledCourse}