export interface ISignupEmail{
    fullname:string
    role:string
    email:string
}

export interface IVerifiedTutor{
    fullname:string
    email:string

}

export interface IVerifiedCourse extends IVerifiedTutor{
coursename:string
}

export interface ICourseEnrolled extends IVerifiedCourse{
    tutorname:string
}

export type ICourseCertificate = IVerifiedCourse