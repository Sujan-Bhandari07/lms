import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export interface UserProfile {
  _id: string
  fullname: string
  email: string
  role: 'student' | 'tutor' | 'admin'
  profilepic: string
}

export interface PendingCourse {
  _id: string
  coursename: string
  title: string
  desc: string
  techstack: string
  tutor: { tutorid: string; tutorname: string }
  price: number
  discount: number
  createdAt?: string
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
  tutor: { tutorid: string; tutorname: string; profilepic?: string }
  parts: { title: string; partdesc: string; videourl?: string }[]
  isverified: boolean
  price: number
  discount: number
  providecompletionoption: boolean
  totalenrolledstudents?: { userid: string; username: string }[]
  enrollmentCount?: number
  averageRating?: number
  ratings?: { studentname: string; rating: number }[]
  comments?: { studentname: string; comment: string }[]
  iscompleted?: boolean
  enrollmentSource?: 'payment' | 'development' | 'free'
  isDevelopmentEnrollment?: boolean
}

export interface CoursePage {
  items: Course[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface TutorProfile {
  userid: string
  fullname: string
  profilepic: string
  acedemics: string
  experience: string
  isverified: boolean
  verificationStatus?: 'pending' | 'approved' | 'rejected'
  certificates?: string[]
}

export interface PendingTutor {
  userid: string
  fullname: string
  email: string
  profilepic: string
  acedemics: string
  experience: string
  certificates: string[]
  verificationStatus: 'pending' | 'approved' | 'rejected'
}

export interface PaymentCheckout {
  amount: number
  total_amount: number
  transaction_uuid: string
  product_code: string
  signature: string
  gateway_url: string
}

export interface PaymentEnrollment {
  courseid: string
  transaction_uuid: string
  status: 'success'
  enrollmentSource: 'payment' | 'development' | 'free'
  paymentStatus: 'success' | 'pending' | 'failed'
}

export interface CourseCertificate {
  coursename: string
  tutor: string
  courseid: string
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

export interface AiConversationSummary {
  id: string
  title: string
  latestMessage: string
  lastMessageAt: string | null
  updatedAt: string
}

export interface AiChatMessage {
  id: string
  conversationId: string
  role: 'user' | 'assistant'
  text: string
  createdAt: string
}

export interface AiChatResult {
  conversation: AiConversationSummary
  userMessage: AiChatMessage
  assistantMessage: AiChatMessage
}

export interface AiMessagesResponse {
  conversation: AiConversationSummary
  messages: AiChatMessage[]
  hasMore: boolean
  nextCursor: string | null
}

export interface ChatCourseContext {
  courseid: string
  coursename: string
}

export interface ChatContact {
  userid: string
  fullname: string
  profilepic: string
  role: 'student' | 'tutor'
  courses: ChatCourseContext[]
}

export interface ChatMessage {
  id: string
  conversationId: string
  studentId: string
  instructorId: string
  senderId: string
  text: string
  createdAt: string
  readAt: string | null
}

export interface ChatConversationItem {
  pairKey: string
  participantId: string
  conversationId: string | null
  latestMessage: string
  lastMessageAt: string | null
  unreadCount: number
  contact: ChatContact
  online: boolean
}

export interface ChatMessagesResponse {
  conversationId: string
  messages: ChatMessage[]
  hasMore: boolean
  nextCursor: string | null
  contact: ChatContact
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api', credentials: 'include' }),
  tagTypes: [
    'Profile',
    'TutorCourses',
    'PublicCourses',
    'Course',
    'Enrollments',
    'Certificates',
    'TutorProfile',
    'TutorStudents',
    'PendingCourses',
    'PendingTutors',
    'AiConversations',
    'AiMessages',
    'ChatConversations',
    'ChatMessages',
  ],
  endpoints: (builder) => ({
    register: builder.mutation<
      ApiResponse<UserProfile>,
      { fullname: string; email: string; password: string; role: 'student' | 'tutor' }
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
    getPublicCourses: builder.query<
      ApiResponse<CoursePage>,
      { q?: string; page?: number; limit?: number; sort?: string; minPrice?: number; maxPrice?: number }
    >({
      query: (params) => ({ url: '/courses/catalog', params }),
      providesTags: ['PublicCourses'],
    }),
    getPublicCourseById: builder.query<ApiResponse<Course>, string>({
      query: (courseid) => `/courses/catalog/${encodeURIComponent(courseid)}`,
      providesTags: (_result, _error, courseid) => [{ type: 'Course', id: courseid }],
    }),
    postCourseComment: builder.mutation<ApiResponse, { courseid: string; comment: string }>({
      query: ({ courseid, comment }) => ({
        url: `/courses/catalog/${encodeURIComponent(courseid)}/comments`,
        method: 'POST',
        body: { comment },
      }),
      invalidatesTags: (_result, _error, { courseid }) => [{ type: 'Course', id: courseid }],
    }),
    postCourseRating: builder.mutation<ApiResponse, { courseid: string; rating: number }>({
      query: ({ courseid, rating }) => ({
        url: `/courses/catalog/${encodeURIComponent(courseid)}/ratings`,
        method: 'POST',
        body: { rating },
      }),
      invalidatesTags: (_result, _error, { courseid }) => [{ type: 'Course', id: courseid }],
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
    getTutorStudents: builder.query<ApiResponse<{ userid: string; username: string }[]>, void>({
      query: () => '/users/tutor/students',
      providesTags: ['TutorStudents'],
    }),
    getTutorProfile: builder.query<ApiResponse<TutorProfile>, void>({
      query: () => '/users/tutorprofile',
      providesTags: ['TutorProfile'],
    }),
    saveTutorProfile: builder.mutation<ApiResponse, { acedemics: string; experience: string }>({
      query: (body) => ({ url: '/users/tutorprofile', method: 'PATCH', body }),
      invalidatesTags: ['TutorProfile'],
    }),
    getEnrollments: builder.query<ApiResponse<Course[]>, void>({
      query: () => '/users/enrollments',
      providesTags: ['Enrollments'],
    }),
    enrollCourse: builder.mutation<ApiResponse<{ courseid: string }>, { courseid: string }>({
      query: (body) => ({ url: '/users/enrollments', method: 'POST', body }),
      invalidatesTags: ['Enrollments', 'PublicCourses', 'Course'],
    }),
    completeEnrolledCourse: builder.mutation<ApiResponse, { courseid: string }>({
      query: ({ courseid }) => ({ url: `/users/enrollments/${encodeURIComponent(courseid)}/complete`, method: 'POST' }),
      invalidatesTags: ['Enrollments', 'Course'],
    }),
    getCertificates: builder.query<ApiResponse<CourseCertificate[]>, void>({
      query: () => '/users/certificates',
      providesTags: ['Certificates'],
    }),
    createCertificate: builder.mutation<ApiResponse, { courseid: string }>({
      query: (body) => ({ url: '/users/certificates', method: 'POST', body }),
      invalidatesTags: ['Certificates', 'Enrollments'],
    }),
    getCoursesByTutor: builder.query<ApiResponse<Course[]>, void>({
      query: () => '/courses/catalog/manage',
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
        return { url: '/courses/catalog/manage', method: 'POST', body }
      },
      invalidatesTags: ['TutorCourses', 'PublicCourses'],
    }),
    updateCourse: builder.mutation<
      ApiResponse<Course>,
      { courseid: string; coursename?: string; desc?: string; techstack?: string; price?: number; discount?: number; photo?: File }
    >({
      query: ({ courseid, photo, ...fields }) => {
        const body = new FormData()
        Object.entries(fields).forEach(([key, value]) => {
          if (value !== undefined) body.append(key, String(value))
        })
        if (photo) body.append('photo', photo)
        return { url: `/courses/catalog/manage/${encodeURIComponent(courseid)}`, method: 'PATCH', body }
      },
      invalidatesTags: ['TutorCourses', 'PublicCourses', 'Course'],
    }),
    verifyCourse: builder.mutation<ApiResponse, { verify: boolean; courseid: string }>({
      query: (body) => ({ url: '/courses/verifycourse', method: 'POST', body }),
      invalidatesTags: ['TutorCourses'],
    }),
    getPendingCourses: builder.query<ApiResponse<PendingCourse[]>, void>({
      query: () => '/admin/courses/pending',
      providesTags: ['PendingCourses'],
    }),
    getPendingTutors: builder.query<ApiResponse<PendingTutor[]>, void>({
      query: () => '/admin/tutors/pending',
      providesTags: ['PendingTutors'],
    }),
    verifyTutorApplication: builder.mutation<
      ApiResponse,
      { userid: string; decision: 'approve' | 'reject' }
    >({
      query: ({ userid, decision }) => ({
        url: `/admin/tutors/${encodeURIComponent(userid)}/${decision}`,
        method: 'POST',
      }),
      invalidatesTags: ['PendingTutors'],
    }),
    approveCourse: builder.mutation<ApiResponse, { courseid: string }>({
      query: ({ courseid }) => ({
        url: `/admin/courses/${encodeURIComponent(courseid)}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['PendingCourses', 'PublicCourses', 'TutorCourses'],
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
      query: ({ courseid }) => ({ url: `/courses/catalog/manage/${encodeURIComponent(courseid)}/completion-option`, method: 'POST' }),
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
        return { url: `/courses/catalog/manage/${encodeURIComponent(fields.courseid)}/parts`, method: 'POST', body }
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
    initiatePayment: builder.mutation<
      ApiResponse<PaymentCheckout>,
      { courseid: string; transaction_uuid: string }
    >({
      query: (body) => ({ url: '/payments/initiate', method: 'POST', body }),
    }),
    verifyPayment: builder.mutation<ApiResponse<PaymentEnrollment>, { data: string }>({
      query: (body) => ({ url: '/payments/verify', method: 'POST', body }),
      invalidatesTags: ['Enrollments', 'PublicCourses', 'Course'],
    }),
    getAiConversations: builder.query<ApiResponse<AiConversationSummary[]>, void>({
      query: () => '/ai/conversations',
      providesTags: ['AiConversations'],
    }),
    createAiConversation: builder.mutation<ApiResponse<AiConversationSummary>, void>({
      query: () => ({ url: '/ai/conversations', method: 'POST' }),
      invalidatesTags: ['AiConversations'],
    }),
    getAiMessages: builder.query<
      ApiResponse<AiMessagesResponse>,
      { conversationId: string; before?: string; limit?: number }
    >({
      query: ({ conversationId, before, limit }) => ({
        url: `/ai/conversations/${encodeURIComponent(conversationId)}/messages`,
        params: { before, limit },
      }),
      providesTags: (_result, _error, { conversationId }) => [
        { type: 'AiMessages', id: conversationId },
      ],
    }),
    sendAiChat: builder.mutation<
      ApiResponse<AiChatResult>,
      { text: string; conversationId?: string }
    >({
      query: (body) => ({ url: '/ai/chat', method: 'POST', body }),
      invalidatesTags: (_result, _error, body) => [
        'AiConversations',
        ...(body.conversationId ? [{ type: 'AiMessages' as const, id: body.conversationId }] : []),
      ],
    }),
    getChatConversations: builder.query<
      ApiResponse<{ conversations: ChatConversationItem[] }>,
      void
    >({
      query: () => '/chat/conversations',
      providesTags: ['ChatConversations'],
    }),
    openChatConversation: builder.mutation<
      ApiResponse<{ conversationId: string; contact: ChatContact }>,
      { participantId: string }
    >({
      query: (body) => ({ url: '/chat/conversations', method: 'POST', body }),
      invalidatesTags: ['ChatConversations'],
    }),
    getChatMessages: builder.query<
      ApiResponse<ChatMessagesResponse>,
      { participantId: string; before?: string; limit?: number }
    >({
      query: ({ participantId, before, limit }) => ({
        url: `/chat/conversations/${encodeURIComponent(participantId)}/messages`,
        params: { before, limit },
      }),
      providesTags: (_result, _error, { participantId }) => [
        { type: 'ChatMessages', id: participantId },
      ],
    }),
    sendChatMessage: builder.mutation<
      ApiResponse<{ message: ChatMessage; unreadCount: number }>,
      { participantId: string; text: string; clientMessageId?: string }
    >({
      query: ({ participantId, text, clientMessageId }) => ({
        url: `/chat/conversations/${encodeURIComponent(participantId)}/messages`,
        method: 'POST',
        body: { text, clientMessageId },
      }),
      invalidatesTags: (_result, _error, { participantId }) => [
        'ChatConversations',
        { type: 'ChatMessages', id: participantId },
      ],
    }),
    markChatRead: builder.mutation<ApiResponse, string>({
      query: (participantId) => ({
        url: `/chat/conversations/${encodeURIComponent(participantId)}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['ChatConversations'],
    }),
    getChatUnreadCount: builder.query<ApiResponse<{ unreadCount: number }>, void>({
      query: () => '/chat/unread-count',
      providesTags: ['ChatConversations'],
    }),
  }),
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useGetPublicCoursesQuery,
  useGetPublicCourseByIdQuery,
  usePostCourseCommentMutation,
  usePostCourseRatingMutation,
  useUpdateProfileMutation,
  useUpdateTutorProfileMutation,
  useVerifyTutorMutation,
  useUpdateEnrolledCourseMutation,
  useUpdateCertificateMutation,
  useToggleCourseCompletedMutation,
  useGetStudentsMutation,
  useGetTutorStudentsQuery,
  useGetTutorProfileQuery,
  useSaveTutorProfileMutation,
  useGetEnrollmentsQuery,
  useLazyGetEnrollmentsQuery,
  useEnrollCourseMutation,
  useCompleteEnrolledCourseMutation,
  useGetCertificatesQuery,
  useCreateCertificateMutation,
  useGetCoursesByTutorQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useVerifyCourseMutation,
  useGetPendingCoursesQuery,
  useGetPendingTutorsQuery,
  useVerifyTutorApplicationMutation,
  useApproveCourseMutation,
  useSendCourseCommentMutation,
  useSendCourseRatingMutation,
  useToggleCourseCompletionOptionMutation,
  useUploadCoursePartMutation,
  useCreatePaymentMutation,
  useInitiatePaymentMutation,
  useVerifyPaymentMutation,
  useGetAiConversationsQuery,
  useCreateAiConversationMutation,
  useGetAiMessagesQuery,
  useLazyGetAiMessagesQuery,
  useSendAiChatMutation,
  useGetChatConversationsQuery,
  useOpenChatConversationMutation,
  useGetChatMessagesQuery,
  useLazyGetChatMessagesQuery,
  useSendChatMessageMutation,
  useMarkChatReadMutation,
  useGetChatUnreadCountQuery,
} = userApi

export default userApi
