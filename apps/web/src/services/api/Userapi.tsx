import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface UserProfile {
  _id: string
  fullname: string
  email: string
  role: 'student' | 'tutor'
  profilepic: string
}

export interface ApiResponse<T = undefined> {
  success: boolean
  message: string
  payload?: T
}

export interface Course {
  _id: string
  coursename: string
  title: string
  desc: string
  techstack: string
  tutor: { tutorid: string; tutorname: string }
  parts: { title: string; partdesc: string; videourl: string }[]
  isverified: boolean
  price: number
  discount: number
  providecompletionoption: boolean
  totalenrolledstudents: { userid: string; username: string }[]
}

export interface CreateCourseRequest {
  coursename: string
  desc: string
  techstack: string
  tutor: { tutorid: string; tutorname: string }
  price: number
  discount?: number
  photo: File
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api', credentials: 'include' }),
  tagTypes: ['Profile', 'TutorCourses'],
  endpoints: (builder) => ({
    register: builder.mutation<
      ApiResponse<UserProfile>,
      { fullname: string; email: string; password: string; role: UserProfile['role'] }
    >({
      query: (body) => ({ url: '/users/register', method: 'POST', body }),
      invalidatesTags: ['Profile'],
    }),
    login: builder.mutation<
      ApiResponse<UserProfile>,
      { email: string; password: string }
    >({
      query: (body) => ({ url: '/users/login', method: 'POST', body }),
      invalidatesTags: ['Profile'],
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: '/users/logout', method: 'POST' }),
    }),
    getProfile: builder.query<ApiResponse<UserProfile>, void>({
      query: () => '/users/getprofile',
      providesTags: ['Profile'],
    }),
    updateProfile: builder.mutation<
      ApiResponse<UserProfile>,
      FormData
    >({
      query: (body) => ({ url: '/users/updateprofile', method: 'POST', body }),
      invalidatesTags: ['Profile'],
    }),
    updateTutorProfile: builder.mutation<
      ApiResponse,
      { userid: string; acedemics: string; experience: string }
    >({
      query: (body) => ({ url: '/users/updatetutorprofile', method: 'POST', body }),
    }),
    verifyTutor: builder.mutation<ApiResponse, { userid: string }>({
      query: (body) => ({ url: '/users/verifytutor', method: 'POST', body }),
    }),
    updateEnrolledCourse: builder.mutation<
      ApiResponse,
      { coursename: string; tutor: string; courseid: string; studentid: string }
    >({
      query: (body) => ({ url: '/users/updateenrolledcourse', method: 'POST', body }),
    }),
    updateCertificate: builder.mutation<
      ApiResponse,
      { coursename: string; tutor: string; courseid: string; studentid: string }
    >({
      query: (body) => ({ url: '/users/updatecertificate', method: 'POST', body }),
    }),
    toggleCourseCompleted: builder.mutation<
      ApiResponse,
      { courseid: string; studentid: string }
    >({
      query: (body) => ({ url: '/users/toggleiscompleted', method: 'POST', body }),
    }),
    getStudents: builder.mutation<ApiResponse<{ userid: string; username: string }[]>, { tutorid: string }>({
      query: (body) => ({ url: '/users/getstudents', method: 'POST', body }),
    }),
    getCoursesByTutor: builder.query<ApiResponse<Course[]>, { tutorid: string; tutorname: string }>({
      query: (params) => ({ url: '/courses/getcoursesbytutor', params }),
      providesTags: ['TutorCourses'],
    }),
    createCourse: builder.mutation<ApiResponse<Course>, CreateCourseRequest>({
      query: ({ photo, tutor, ...fields }) => {
        const body = new FormData()
        Object.entries(fields).forEach(([key, value]) => {
          if (value !== undefined) body.append(key, String(value))
        })
        body.append('tutor[tutorid]', tutor.tutorid)
        body.append('tutor[tutorname]', tutor.tutorname)
        body.append('photo', photo)
        return { url: '/courses/createcourse', method: 'POST', body }
      },
      invalidatesTags: ['TutorCourses'],
    }),
    verifyCourse: builder.mutation<ApiResponse, { verify: boolean; courseid: string }>({
      query: (body) => ({ url: '/courses/verifycourse', method: 'POST', body }),
      invalidatesTags: ['TutorCourses'],
    }),
    sendCourseComment: builder.mutation<
      ApiResponse,
      { comment: string; courseid: string; studentname: string }
    >({
      query: (body) => ({ url: '/courses/sendcomment', method: 'POST', body }),
    }),
    sendCourseRating: builder.mutation<
      ApiResponse,
      { rating: number; courseid: string; studentname: string }
    >({
      query: (body) => ({ url: '/courses/sendrating', method: 'POST', body }),
    }),
    toggleCourseCompletionOption: builder.mutation<ApiResponse, { courseid: string }>({
      query: (body) => ({ url: '/courses/providecompletionoption', method: 'POST', body }),
      invalidatesTags: ['TutorCourses'],
    }),
    uploadCoursePart: builder.mutation<
      ApiResponse,
      { courseid: string; title: string; partdesc: string; part: File }
    >({
      query: ({ part, ...fields }) => {
        const body = new FormData()
        Object.entries(fields).forEach(([key, value]) => body.append(key, value))
        body.append('part', part)
        return { url: '/courses/uploadpart', method: 'POST', body }
      },
      invalidatesTags: ['TutorCourses'],
    }),
    createPayment: builder.mutation<
      ApiResponse,
      {
        transaction_uuid: string
        courseid: string
        sender: { username: string; userid: string }
        receiver: { username: string; userid: string }
        amount: number
      }
    >({
      query: (body) => ({ url: '/createPayment', method: 'POST', body }),
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdateTutorProfileMutation,
  useVerifyTutorMutation,
  useUpdateEnrolledCourseMutation,
  useUpdateCertificateMutation,
  useToggleCourseCompletedMutation,
  useGetStudentsMutation,
  useGetCoursesByTutorQuery,
  useCreateCourseMutation,
  useVerifyCourseMutation,
  useSendCourseCommentMutation,
  useSendCourseRatingMutation,
  useToggleCourseCompletionOptionMutation,
  useUploadCoursePartMutation,
  useCreatePaymentMutation,
} = userApi

export default userApi
