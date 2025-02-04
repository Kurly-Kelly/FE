"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/modal/modal";
import { Footer } from "@/components/layout/footer";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  signupUser,
  checkEmailDuplicate,
  checkIdDuplicate,
  checkPhoneDuplicate,
  sendEmailVerificationCode,
  emailVerification,
} from "@/feature/signup/authService";
import { useState } from "react";

type SignupFormData = {
  userName: string;
  password: string;
  confirmPassword: string;
  name: string;
  email: string;
  emailVerificationCode: string;
  phone: string;
  // 약관 동의
  terms1: boolean;
  terms2: boolean;
  terms3: boolean;
  terms4: boolean;
  terms5: boolean;
};

export default function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors,
    control,
    // setValue,
  } = useForm<SignupFormData>({
    defaultValues: {
      userName: "",
      password: "",
      confirmPassword: "",
      name: "",
      email: "",
      emailVerificationCode: "",
      phone: "",
      terms1: false,
      terms2: false,
      terms3: false,
      terms4: false,
      terms5: false,
    },
  });

  const router = useRouter();
  const [modal, setModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [showEmailVerificationInput, setShowEmailVerificationInput] =
    useState(false);

  const userNameValue = watch("userName");
  const emailValue = watch("email");
  const phoneValue = watch("phone");
  const passwordValue = watch("password");
  // const confirmPasswordValue = watch("confirmPassword");

  // 회원가입 폼 제출 처리
  const onSubmit = async (data: SignupFormData) => {
    // 비밀번호 일치 여부 검사
    if (data.password !== data.confirmPassword) {
      setError("confirmPassword", { message: "비밀번호가 일치하지 않습니다" });
      return;
    }

    // 필수 약관: terms1, terms2, terms5 (필수 약관만 예시)
    if (!(data.terms1 && data.terms2 && data.terms5)) {
      setModal({ isOpen: true, message: "필수 약관에 모두 동의해주세요." });
      return;
    }

    setIsLoading(true);
    try {
      const result = await signupUser({
        userName: data.userName,
        password: data.password,
        name: data.name,
        email: data.email,
        phone: data.phone,
      });
      setModal({
        isOpen: true,
        message: result.message,
        onConfirm: () => router.push("/login"),
      });
    } catch (error: any) {
      setModal({
        isOpen: true,
        message: error.message || "회원가입 중 오류가 발생했습니다.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 중복 체크 함수들
  const handleIdDuplicateCheck = async () => {
    if (!userNameValue) {
      setModal({ isOpen: true, message: "아이디를 입력해주세요." });
      return;
    }
    setIsLoading(true);
    try {
      const isDuplicate = await checkIdDuplicate(userNameValue);
      if (isDuplicate) {
        setError("userName", { message: "중복된 아이디입니다." });
      } else {
        clearErrors("userName");
        setModal({ isOpen: true, message: "사용 가능한 아이디입니다." });
      }
    } catch (error: any) {
      setModal({ isOpen: true, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailDuplicateCheck = async () => {
    if (!emailValue) {
      setModal({ isOpen: true, message: "이메일을 입력해주세요." });
      return;
    }
    setIsLoading(true);
    try {
      const isDuplicate = await checkEmailDuplicate(emailValue);
      if (isDuplicate) {
        setError("email", { message: "중복된 이메일입니다." });
      } else {
        clearErrors("email");
        setModal({ isOpen: true, message: "사용 가능한 이메일입니다." });
        setShowEmailVerificationInput(true);
        await sendEmailVerificationCode(emailValue);
        setModal({ isOpen: true, message: "인증번호가 발송되었습니다." });
      }
    } catch (error: any) {
      setModal({ isOpen: true, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneDuplicateCheck = async () => {
    if (!phoneValue) {
      setModal({ isOpen: true, message: "전화번호를 입력해주세요." });
      return;
    }
    setIsLoading(true);
    try {
      const isDuplicate = await checkPhoneDuplicate(phoneValue);
      if (isDuplicate) {
        setError("phone", { message: "중복된 전화번호입니다." });
      } else {
        clearErrors("phone");
        setModal({ isOpen: true, message: "사용 가능한 전화번호입니다." });
      }
    } catch (error: any) {
      setModal({ isOpen: true, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailVerificationConfirm = async () => {
    if (!emailValue) {
      setModal({ isOpen: true, message: "이메일을 입력해주세요." });
      return;
    }
    if (!watch("emailVerificationCode")) {
      setModal({ isOpen: true, message: "인증번호를 입력해주세요." });
      return;
    }
    setIsLoading(true);
    try {
      const result = await emailVerification(
        emailValue,
        watch("emailVerificationCode"),
      );
      if (result) {
        setModal({ isOpen: true, message: "인증이 완료되었습니다." });
      } else {
        setModal({ isOpen: true, message: "인증번호가 일치하지 않습니다." });
      }
    } catch (error: any) {
      setModal({ isOpen: true, message: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={modal.isOpen}
        onClose={() => setModal({ ...modal, isOpen: false })}
        message={modal.message}
        onConfirm={modal.onConfirm}
      />
      <div className="mx-auto w-[360px] bg-white">
        <div className="relative flex h-[30px] items-center justify-center">
          <button
            className="absolute left-5 flex h-full items-center justify-center"
            onClick={() => router.back()}
          >
            <X size={24} />
          </button>
          <div className="text-center text-lg font-medium">회원가입</div>
        </div>
        <div className="mb-4 w-full border-b pt-4"></div>
        <form
          className="mx-auto w-[360px] rounded-lg bg-white px-4 pb-[52px]"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="space-y-4">
            {/* 아이디 입력 */}
            <div className="space-y-2">
              <Label htmlFor="userName">
                아이디<span className="text-red-500">*</span>
              </Label>
              <div className="flex h-[46px] gap-2">
                <Input
                  id="userName"
                  placeholder="아이디를 입력해주세요"
                  {...register("userName", {
                    required: "아이디를 입력해주세요",
                    minLength: {
                      value: 4,
                      message: "아이디는 4자 이상이어야 합니다",
                    },
                    pattern: {
                      value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/,
                      message: "아이디는 영문과 숫자의 조합이어야 합니다",
                    },
                  })}
                  className="size-full rounded-md text-sm placeholder:text-[#CCCCCC]"
                />
                <Button
                  variant="outline"
                  className="h-full whitespace-nowrap border-emerald-500 text-emerald-500"
                  type="button"
                  onClick={() => handleIdDuplicateCheck()}
                  disabled={isLoading}
                >
                  중복확인
                </Button>
              </div>
              {errors.userName && (
                <p className="text-xs text-red-500">
                  {errors.userName.message}
                </p>
              )}
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="password">
                비밀번호<span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력해주세요"
                {...register("password", {
                  required: "비밀번호를 입력해주세요",
                  minLength: {
                    value: 8,
                    message: "비밀번호는 8자 이상이어야 합니다",
                  },
                })}
                className="h-[46px] w-full rounded-md text-sm placeholder:text-[#CCCCCC]"
              />
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                비밀번호 확인<span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="비밀번호를 한번 더 입력해주세요"
                {...register("confirmPassword", {
                  required: "비밀번호 확인을 입력해주세요",
                  validate: (value) =>
                    value === passwordValue || "비밀번호가 일치하지 않습니다",
                })}
                className="h-[46px] w-full rounded-md text-sm placeholder:text-[#CCCCCC]"
              />
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* 이름 입력 */}
            <div className="space-y-2">
              <Label htmlFor="name">
                이름<span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="이름을 입력해주세요"
                {...register("name", { required: "이름을 입력해주세요" })}
                className="h-[46px] w-full rounded-md text-sm placeholder:text-[#CCCCCC]"
              />
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* 이메일 입력 */}
            <div className="space-y-2">
              <Label htmlFor="email">
                이메일<span className="text-red-500">*</span>
              </Label>
              <div className="flex h-[46px] gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="예: marketpaaa@gmail.com"
                  {...register("email", {
                    required: "이메일을 입력해주세요",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "올바른 이메일 형식이 아닙니다",
                    },
                  })}
                  className="size-full rounded-md text-sm placeholder:text-[#CCCCCC]"
                />
                <Button
                  variant="outline"
                  className="h-full whitespace-nowrap border-emerald-500 text-emerald-500"
                  type="button"
                  onClick={() => handleEmailDuplicateCheck()}
                  disabled={isLoading}
                >
                  중복확인
                </Button>
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
              {showEmailVerificationInput && (
                <div className="mt-2 flex h-[46px] gap-2">
                  <Input
                    placeholder="인증번호를 입력해주세요"
                    {...register("emailVerificationCode")}
                    className="size-full rounded-md text-sm placeholder:text-[#CCCCCC]"
                  />
                  <Button
                    variant="outline"
                    className="h-full whitespace-nowrap border-emerald-500 text-emerald-500"
                    type="button"
                    onClick={handleEmailVerificationConfirm}
                    disabled={isLoading}
                  >
                    인증번호 확인
                  </Button>
                </div>
              )}
            </div>

            {/* 휴대폰 번호 입력 */}
            <div className="space-y-2">
              <Label htmlFor="phone">
                휴대폰<span className="text-red-500">*</span>
              </Label>
              <div className="flex h-[46px] gap-2">
                <Input
                  id="phone"
                  placeholder="숫자만 입력해주세요"
                  {...register("phone", {
                    required: "전화번호를 입력해주세요",
                    pattern: {
                      value: /^[0-9]{10,11}$/,
                      message: "올바른 전화번호 형식이 아닙니다",
                    },
                  })}
                  className="size-full rounded-md text-sm placeholder:text-[#CCCCCC]"
                />
                <Button
                  variant="outline"
                  className="h-full whitespace-nowrap border-emerald-500 text-emerald-500"
                  type="button"
                  onClick={() => handlePhoneDuplicateCheck()}
                  disabled={isLoading}
                >
                  중복확인
                </Button>
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* 약관 동의 */}
            <div className="space-y-2 pt-4">
              <h2 className="text-sm font-bold">
                이용약관동의<span className="text-red-500">*</span>
              </h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Controller
                    control={control}
                    name="terms1"
                    render={({ field: { value, onChange } }) => (
                      <Checkbox
                        id="terms1"
                        checked={value}
                        onCheckedChange={onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor="terms1"
                    className="text-sm font-medium leading-none"
                  >
                    이용약관 동의 (필수)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Controller
                    control={control}
                    name="terms2"
                    render={({ field: { value, onChange } }) => (
                      <Checkbox
                        id="terms2"
                        checked={value}
                        onCheckedChange={onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor="terms2"
                    className="text-sm font-medium leading-none"
                  >
                    개인정보 이용 동의 (필수)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Controller
                    control={control}
                    name="terms3"
                    render={({ field: { value, onChange } }) => (
                      <Checkbox
                        id="terms3"
                        checked={value}
                        onCheckedChange={onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor="terms3"
                    className="text-sm font-medium leading-none"
                  >
                    개인정보 이용 동의 (선택)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Controller
                    control={control}
                    name="terms4"
                    render={({ field: { value, onChange } }) => (
                      <Checkbox
                        id="terms4"
                        checked={value}
                        onCheckedChange={onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor="terms4"
                    className="text-sm font-medium leading-none"
                  >
                    무료배송, 할인 쿠폰 등 혜택/정보 수신 동의 (선택)
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Controller
                    control={control}
                    name="terms5"
                    render={({ field: { value, onChange } }) => (
                      <Checkbox
                        id="terms5"
                        checked={value}
                        onCheckedChange={onChange}
                      />
                    )}
                  />
                  <label
                    htmlFor="terms5"
                    className="text-sm font-medium leading-none"
                  >
                    본인은 만 14세 이상입니다. (필수)
                  </label>
                </div>
              </div>
            </div>

            {/* 가입하기 버튼 */}
            <Button
              className="mt-6 h-[46px] w-full bg-emerald-500 text-white hover:bg-emerald-600"
              type="submit"
              disabled={isLoading}
            >
              가입하기
            </Button>
          </div>
        </form>
        <Footer />
      </div>
    </>
  );
}
