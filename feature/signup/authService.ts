import myApi from "@/lib/axios";

export interface SignupData {
  userName: string;
  password: string;
  name: string;
  email: string;
  phone: string;
}

export async function signupUser(
  data: SignupData,
): Promise<{ message: string }> {
  try {
    console.log("서버로 보낼 데이터:", data);
    const response = await myApi.post("/users/signup", data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response);
    if (!response.status) {
      const errorData = await response.data;
      throw new Error(errorData.message || "회원가입에 실패했습니다.");
    }

    const result = await response.data;
    console.log("서버 응답 데이터:", result);

    return { message: "회원가입이 완료되었습니다!" };
  } catch (error: any) {
    throw new Error(error.message || "서버에 문제가 발생했습니다.");
  }
}

export async function checkEmailDuplicate(email: string): Promise<boolean> {
  try {
    const response = await myApi.get(`/users/email?e=${email}`);
    if (!response.status) {
      throw new Error("이메일 중복 확인 요청 중 오류가 발생했습니다.");
    }

    const isDuplicate = await response.data; // true 또는 false
    console.log(isDuplicate);
    return isDuplicate;
  } catch (error: any) {
    throw new Error(error.message || "서버에 문제가 발생했습니다.");
  }
}

export async function checkIdDuplicate(userName: string): Promise<boolean> {
  try {
    const response = await myApi.get(`/users/id?id=${userName}`);

    if (!response.status) {
      throw new Error("Id 중복 확인 요청 중 오류가 발생했습니다.");
    }

    const isDuplicate = await response.data; // true 또는 false
    return isDuplicate;
  } catch (error: any) {
    throw new Error(error.message || "서버에 문제가 발생했습니다.");
  }
}

export async function checkPhoneDuplicate(phone: string): Promise<boolean> {
  try {
    const response = await myApi.get(`/users/phone?p=${phone}`);

    if (!response.status) {
      throw new Error("전화번호 중복 확인 요청 중 오류가 발생했습니다.");
    }

    const isDuplicate = await response.data;
    return isDuplicate;
  } catch (error: any) {
    throw new Error(error.message || "서버에 문제가 발생했습니다.");
  }
}

export async function sendEmailVerificationCode(
  email: string,
): Promise<boolean> {
  try {
    const response = await myApi.post(
      `/users/email/verification-requests?e=${email}`,
      {},
    );

    if (!response.status) {
      throw new Error("이메일 인증코드를 발송하는 중 오류가 발생했습니다.");
    }

    const isDuplicate = await response.data;

    return isDuplicate;
  } catch (error: any) {
    throw new Error(error.message || "서버에 문제가 발생했습니다.");
  }
}

export async function emailVerification(
  email: string,
  code: string,
): Promise<boolean> {
  try {
    const response = await myApi.get(
      `/users/email/verification?e=${email}&code=${code}`,
    );

    if (!response.status) {
      throw new Error("이메일 인증을 진행하는 중 오류가 발생했습니다.");
    }

    console.log(response);
    const isDuplicate = await response.data.status;
    return isDuplicate;
  } catch (error: any) {
    throw new Error(error.message || "서버에 문제가 발생했습니다.");
  }
}
