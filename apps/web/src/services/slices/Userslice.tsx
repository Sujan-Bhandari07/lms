import { createSlice, type PayloadAction } from "@reduxjs/toolkit";



interface UserState {
  _id:string
  fullname: string;
  email: string;
  role: string;
  profilepic: string;
}

const initialState: UserState = {
  _id:"",
  fullname: "",
  email: "",
  role: "",
  profilepic:""

};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setuser(state , action:PayloadAction<UserState>){

      const {fullname,email,_id,profilepic,role}=action.payload
      state.fullname=fullname
      state.email=email
      state._id=_id
      state.profilepic=profilepic
      state.role=role


    }
  
  },
});

export const { setuser } = userSlice.actions;
export default userSlice.reducer;
