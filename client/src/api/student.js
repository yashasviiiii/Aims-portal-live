import api from "./axios";

export const getStudentRecord = () =>
  api.get("/student/record");