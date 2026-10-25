
interface Itutor{
    tutorname:string
    tutorid:string
}

interface ICreateCourse{
    coursename:string
    title:string
    desc:string
    techstack:string
    tutor:Itutor
    price:number
    discount?:number
    
}

interface IVerifyCourse{
    verify:boolean
    courseid:string
}

interface ISendComment{
    studentname:string
    comment:string
    courseid:string
}
interface IProvideRating{
     studentname:string
    rating:number
    courseid:string
}

interface IUploadpart{
    title:string
    partdesc:string
    videourl:string
    courseid:string
}
interface IGetTutorCourse{

    tutorid:string
    tutorname:string
}

interface IUserCourse{

    userid:string
    username:string,
    courseid:string
}

interface ICourceCompletion{
    courseid:string
}

export {ICreateCourse,ICourceCompletion,IVerifyCourse,IUserCourse,IProvideRating,ISendComment,IUploadpart,IGetTutorCourse}