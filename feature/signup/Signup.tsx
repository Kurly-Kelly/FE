"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/modal/modal";
// import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  signupUser,
  checkEmailDuplicate,
  checkIdDuplicate,
  checkPhoneDuplicate,
  sendEmailVerificationCode,
  emailVerification,
} from "@/feature/signup/authService";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

// 폼 유효성 검사 함수
function validateForm(formData: {
  userName: string;
  password: string;
  confirmPassword: string;
  name: string;
  email: string;
  emailVerificationCode: string;
  phone: string;
}) {
  const errors: { [key: string]: string } = {};

  // 아이디 검증

  if (!formData.userName) {
    errors.id = "아이디를 입력해주세요";
  } else if (formData.userName.length < 4) {
    errors.id = "아이디는 4자 이상이어야 합니다";
  }

  // 비밀번호 검증
  if (!formData.password) {
    errors.password = "비밀번호를 입력해주세요";
  } else if (formData.password.length < 8) {
    errors.password = "비밀번호는 8자 이상이어야 합니다";
  }

  // 비밀번호 확인 검증
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "비밀번호가 일치하지 않습니다";
  }

  // 이름 검증
  if (!formData.name) {
    errors.name = "이름을 입력해주세요";
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email) {
    errors.email = "이메일을 입력해주세요";
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "올바른 이메일 형식이 아닙니다";
  }

  // 전화번호 형식 검증
  const phoneRegex = /^[0-9]{10,11}$/;
  if (!formData.phone) {
    errors.phone = "전화번호를 입력해주세요";
  } else if (!phoneRegex.test(formData.phone)) {
    errors.phone = "올바른 전화번호 형식이 아닙니다";
  }

  return errors;
}

// 필수 약관 검증 함수
function validateTerms(terms: { [key: string]: boolean }) {
  const requiredTerms = ["terms1", "terms2", "terms5"];
  return requiredTerms.every((term) => terms[term]);
}

// 회원가입 폼 컴포넌트
export default function SignupForm() {
  const router = useRouter();
  // 로딩 상태 추가
  const [isLoading, setIsLoading] = useState(false);

  // 중복 상태
  const [isIdDuplicate, setIsIdDuplicate] = useState(false);
  const [isEmailDuplicate, setIsEmailDuplicate] = useState(false);
  const [isPhoneDuplicate, setIsPhoneDuplicate] = useState(false);

  //이메일 인증 상태
  const [isEmailCodeChecked, setisEmailCodeChecked] = useState(false);

  // 중복 확인
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [isPhoneChecked, setIsPhoneChecked] = useState(false);

  const [formData, setFormData] = useState({
    userName: "",
    password: "",
    confirmPassword: "",
    name: "",
    email: "",
    phone: "",
    emailVerificationCode: "",
    verificationCode: "",
  });

  // const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [showEmailVerificationInput, setEmailShowVerificationInput] =
    useState(false);

  const [modal, setModal] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    message: "",
    onConfirm: null,
  });

  const [terms, setTerms] = useState({
    all: false,
    terms1: false,
    terms2: false,
    terms3: false,
    terms4: false,
    terms5: false,
  });

  // const router = useRouter();
  // const goToLogin = () => {
  //   onclick();
  //   router.push("/login");
  // };

  // useEffect(() => {
  //   console.log("");
  //   console.log("isIdChecked:", isIdChecked);
  //   console.log("isEmailChecked:", isEmailChecked);
  //   console.log("isIdDuplicate:", isIdDuplicate);
  //   console.log("isEmailDuplicate:", isEmailDuplicate);
  // }, [isIdChecked, isEmailChecked, isIdDuplicate, isEmailDuplicate]);

  const handleAllTerms = (checked: boolean) => {
    setTerms({
      all: checked,
      terms1: checked,
      terms2: checked,
      terms3: checked,
      terms4: checked,
      terms5: checked,
    });
  };

  const handleSingleTerm = (term: string, checked: boolean) => {
    const newTerms = {
      ...terms,
      [term]: checked,
    };

    const allChecked = Object.entries(newTerms)
      .filter(([key]) => key !== "all")
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .every(([_, value]) => value);

    setTerms({
      ...newTerms,
      all: allChecked,
    });
  };

  // const handleVerificationRequest = async () => {
  //   if (!formData.phone) {
  //     setModal({
  //       isOpen: true,
  //       message: "휴대폰 번호를 입력해주세요.",
  //       onConfirm: null,
  //     });
  //     return;
  //   }

  //   try {
  //     setIsLoading(true);
  //     // 실제 인증번호 발송 API 호출 로직 추가 필요
  //     await new Promise((resolve) => setTimeout(resolve, 1000)); // 임시 지연

  //     setShowVerificationInput(true);
  //     setModal({
  //       isOpen: true,
  //       message: "인증번호가 발송되었습니다.",
  //       onConfirm: null,
  //     });
  //   } catch (error) {
  //     setModal({
  //       isOpen: true,
  //       message: "인증번호 발송 중 오류가 발생했습니다.",
  //       onConfirm: null,
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // const handleVerificationConfirm = async () => {
  //   if (!formData.verificationCode) {
  //     setModal({
  //       isOpen: true,
  //       message: "인증번호를 입력해주세요.",
  //       onConfirm: null,
  //     });
  //     return;
  //   }
  //   console.log(formData.verificationCode);

  //   try {
  //     setIsLoading(true);
  //     // 실제 인증번호 확인 API 호출 로직 추가 필요
  //     await new Promise((resolve) => setTimeout(resolve, 1000)); // 임시 지연

  //     setModal({
  //       isOpen: true,
  //       message: "인증이 완료되었습니다.",
  //       onConfirm: null,
  //     });
  //   } catch (error) {
  //     setModal({
  //       isOpen: true,
  //       message: "인증번호가 일치하지 않습니다.",
  //       onConfirm: null,
  //     });
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  // 이메일 인증번호 확인
  const handleEmailVerificationConfirm = async () => {
    if (!formData.emailVerificationCode) {
      setModal({
        isOpen: true,
        message: "인증번호를 입력해주세요.",
        onConfirm: null,
      });
      return;
    }

    console.log(formData.emailVerificationCode);
    try {
      setIsLoading(true);
      const emailVerificationResult = await emailVerification(
        formData.email,
        formData.emailVerificationCode,
      );
      console.log(emailVerificationResult);
      if (emailVerificationResult) {
        setModal({
          isOpen: true,
          message: "인증이 완료되었습니다.",
          onConfirm: null,
        });
        setisEmailCodeChecked(true);
      } else {
        setModal({
          isOpen: true,
          message: "인증번호가 일치하지 않습니다.",
          onConfirm: null,
        });
        setisEmailCodeChecked(false);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setModal({
        isOpen: true,
        message: "인증번호가 일치하지 않습니다.",
        onConfirm: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // "가입하기" 클릭 시 값 유효성 검사 후 회원가입 API 호출
  const handleSignup = async () => {
    if (isLoading) return;

    try {
      // 폼 유효성 검사
      const formErrors = validateForm(formData);
      if (Object.keys(formErrors).length > 0) {
        setModal({
          isOpen: true,
          message: Object.values(formErrors)[0],
          onConfirm: null,
        });
        return;
      }

      // 필수 약관 검증
      if (!validateTerms(terms)) {
        setModal({
          isOpen: true,
          message: "필수 약관에 모두 동의해주세요.",
          onConfirm: null,
        });
        return;
      }

      if (!isIdChecked) {
        setModal({
          isOpen: true,
          message: "아이디 중복 확인을 해주세요.",
          onConfirm: null,
        });
        return;
      }

      if (isIdDuplicate) {
        setModal({
          isOpen: true,
          message: "중복된 아이디입니다. 다른 아이디를 사용해주세요.",
          onConfirm: null,
        });
        return;
      }

      if (!isEmailChecked) {
        setModal({
          isOpen: true,
          message: "이메일 중복 확인을 해주세요.",
          onConfirm: null,
        });
        return;
      }

      if (isEmailDuplicate) {
        setModal({
          isOpen: true,
          message: "중복된 이메일입니다. 다른 이메일을 사용해주세요.",
          onConfirm: null,
        });
        return;
      }

      if (!isPhoneChecked) {
        setModal({
          isOpen: true,
          message: "전화번호 중복 확인을 해주세요.",
          onConfirm: null,
        });
        return;
      }

      if (isPhoneDuplicate) {
        setModal({
          isOpen: true,
          message: "중복된 전화번호입니다. 다른 전화번호를 사용해주세요.",
          onConfirm: null,
        });
        return;
      }

      if (!isEmailCodeChecked) {
        setModal({
          isOpen: true,
          message: "인증번호가 일치하지 않습니다.",
          onConfirm: null,
        });
        return;
      }

      setIsLoading(true);
      const result = await signupUser({
        userName: formData.userName,
        password: formData.password,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
      });

      setModal({
        isOpen: true,
        message: result.message,
        onConfirm: () => {
          // 모달의 확인 버튼을 누르면 로그인 페이지로 이동
          router.push("/login");
        },
      });

      // 성공 시 폼 초기화
      setFormData({
        userName: "",
        password: "",
        confirmPassword: "",
        name: "",
        email: "",
        phone: "",
        emailVerificationCode: "",
        verificationCode: "",
      });

      // 약관 동의 초기화
      setTerms({
        all: false,
        terms1: false,
        terms2: false,
        terms3: false,
        terms4: false,
        terms5: false,
      });

      // 인증번호 입력 필드 초기화
      setIsIdChecked(false);
      setIsEmailChecked(false);
      setIsPhoneChecked(false);
      // setShowVerificationInput(false);
      setIsIdDuplicate(false);
      setIsEmailDuplicate(false);
      setIsPhoneDuplicate(false);
    } catch (error: any) {
      console.error("API 호출 중 에러:", error);
      setModal({
        isOpen: true,
        message: error.message || "회원가입 중 오류가 발생했습니다.",
        onConfirm: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuplicateCheck = async (type: string) => {
    let value = "";
    if (type === "id") {
      value = formData.userName;
    } else if (type === "email") {
      value = formData.email;
    } else if (type === "phone") {
      value = formData.phone;
    }

    if (!value) {
      setModal({
        isOpen: true,
        message: `${type === "id" ? "아이디" : type === "email" ? "이메일" : "전화번호"}를 입력해주세요.`,
        onConfirm: null,
      });
      return;
    }

    try {
      setIsLoading(true);

      if (type === "id") {
        const isDuplicate = await checkIdDuplicate(value);
        if (isDuplicate === true) {
          setIsIdDuplicate(true);
          setIsIdChecked(false);
          setModal({
            isOpen: true,
            message: "중복된 ID가 있습니다.",
            onConfirm: null,
          });
        } else {
          setIsIdDuplicate(false);
          setIsIdChecked(true);
          setModal({
            isOpen: true,
            message: "사용 가능한 ID입니다.",
            onConfirm: null,
          });
        }
      } else if (type === "email") {
        const isDuplicate = await checkEmailDuplicate(value); // 이메일 중복 확인
        setIsEmailChecked(true);
        if (isDuplicate === true) {
          setIsEmailDuplicate(true);
          setIsEmailChecked(false);
          setModal({
            isOpen: true,
            message: "중복된 이메일이 있습니다.",
            onConfirm: null,
          });
        } else {
          setIsEmailDuplicate(false);
          setIsEmailChecked(true);
          setModal({
            isOpen: true,
            message: "사용 가능한 이메일입니다.",
            onConfirm: null,
          });

          setEmailShowVerificationInput(true);
          const sendEmailCode = await sendEmailVerificationCode(value);
          if (sendEmailCode) {
            setModal({
              isOpen: true,
              message: "인증번호가 발송되었습니다.",
              onConfirm: null,
            });
          } else {
            setModal({
              isOpen: true,
              message: "인증번호 발송 중 오류가 발생했습니다.",
              onConfirm: null,
            });
          }
        }
      } else if (type === "phone") {
        // 전화번호 중복 처리
        const isDuplicate = await checkPhoneDuplicate(value);
        if (isDuplicate) {
          setIsPhoneDuplicate(true);
          setIsPhoneChecked(false);
          setModal({
            isOpen: true,
            message: "중복된 전화번호가 있습니다.",
            onConfirm: null,
          });
        } else {
          setIsPhoneDuplicate(false);
          setIsPhoneChecked(true);
          setModal({
            isOpen: true,
            message: "사용 가능한 전화번호입니다.",
            onConfirm: null,
          });
        }
      }
    } catch (error) {
      console.log(error);
      setModal({
        isOpen: true,
        message: "중복 확인 중 오류가 발생했습니다.",
        onConfirm: null,
      });
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
        onConfirm={modal.onConfirm || undefined}
      />
      <div className="mx-auto w-[360px] bg-white">
        <div className={`relative flex h-[40px] items-center justify-center`}>
          <button
            className="absolute left-5 flex h-full items-center justify-center"
            onClick={() => router.back()}
          >
            <X size={24} />
          </button>
          <div className="text-center text-lg font-medium">회원가입</div>
        </div>
        <div className={`mb-4 w-full border-b pt-4`}></div>
        <div className="mx-auto w-[360px] rounded-lg bg-white px-4 pb-[52px]">
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            {/* 아이디 입력 */}
            <div className="space-y-2">
              <Label htmlFor="id">
                아이디<span className="text-red-500">*</span>
              </Label>
              <div className="flex h-[46px] gap-2">
                <Input
                  id="id"
                  placeholder="아이디를 입력해주세요"
                  value={formData.userName}
                  onChange={(e) =>
                    setFormData({ ...formData, userName: e.target.value })
                  }
                  className={cn(
                    `w-full rounded-md text-sm h-full`,
                    `placeholder:text-[#CCCCCC]`,
                  )}
                  required
                />
                <Button
                  variant="outline"
                  className="h-full whitespace-nowrap border-emerald-500 text-emerald-500"
                  onClick={() => handleDuplicateCheck("id")}
                  type="button"
                  disabled={isLoading}
                >
                  중복확인
                </Button>
              </div>
            </div>

            {/* 비밀번호 입력 */}
            <div className="space-y-2 ">
              <Label htmlFor="password">
                비밀번호<span className="text-red-500">*</span>
              </Label>

              <Input
                id="password"
                type="password"
                placeholder="비밀번호를 입력해주세요"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={cn(
                  `w-full rounded-md text-sm h-[46px]`,
                  `placeholder:text-[#CCCCCC]`,
                )}
                required
              />
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
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                className={cn(
                  `w-full rounded-md text-sm h-[46px]`,
                  `placeholder:text-[#CCCCCC]`,
                )}
                required
              />
            </div>

            {/* 이름 입력 */}
            <div className="space-y-2">
              <Label htmlFor="name">
                이름<span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="이름을 입력해주세요"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className={cn(
                  `w-full rounded-md text-sm h-[46px]`,
                  `placeholder:text-[#CCCCCC]`,
                )}
                required
              />
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
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className={cn(
                    `w-full rounded-md text-sm h-full`,
                    `placeholder:text-[#CCCCCC]`,
                  )}
                />
                <Button
                  variant="outline"
                  className="h-full whitespace-nowrap border-emerald-500 text-emerald-500"
                  onClick={() => handleDuplicateCheck("email")}
                  type="button"
                  disabled={isLoading}
                >
                  중복확인
                </Button>
              </div>
              {showEmailVerificationInput && (
                <div className="mt-2 flex h-[46px] gap-2">
                  <Input
                    placeholder="인증번호를 입력해주세요"
                    value={formData.emailVerificationCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        emailVerificationCode: e.target.value,
                      })
                    }
                    disabled={isLoading || !formData.email}
                    className={cn(
                      `w-full rounded-md text-sm h-full`,
                      `placeholder:text-[#CCCCCC]`,
                    )}
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
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className={cn(
                    `w-full rounded-md text-sm h-full`,
                    `placeholder:text-[#CCCCCC]`,
                  )}
                  required
                />
                <Button
                  variant="outline"
                  className="h-full whitespace-nowrap border-emerald-500 text-emerald-500"
                  onClick={() => handleDuplicateCheck("phone")}
                  type="button"
                  disabled={isLoading}
                >
                  중복확인
                </Button>
                {/* <Button
                  variant="outline"
                  className="whitespace-nowrap border-emerald-500 text-emerald-500"
                  onClick={handleVerificationRequest}
                  type="button"
                  disabled={isLoading || !formData.phone}
                >
                  인증번호 받기
                </Button> */}
              </div>
              {/* {showVerificationInput && (
                <div className="mt-2 flex gap-2">
                  <Input
                    placeholder="인증번호를 입력해주세요"
                    value={formData.verificationCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        verificationCode: e.target.value,
                      })
                    }
                  />
                  <Button
                    variant="outline"
                    className="whitespace-nowrap border-emerald-500 text-emerald-500"
                    type="button"
                    onClick={handleVerificationConfirm}
                    disabled={isLoading}
                  >
                    인증번호 확인
                  </Button>
                </div>
              )} */}
            </div>

            {/* 약관 동의 */}
            <div className="space-y-2 pt-4">
              <h2 className="text-sm font-medium">
                이용약관동의<span className="text-red-500">*</span>
              </h2>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms-all"
                    checked={terms.all}
                    onCheckedChange={handleAllTerms}
                  />
                  <label
                    htmlFor="terms-all"
                    className="text-sm font-medium leading-none"
                  >
                    전체 동의합니다.
                  </label>
                </div>
                <p className="ml-6 text-xs text-gray-500">
                  선택항목에 동의하지 않은 경우도 회원가입 및 일반적인 서비스를
                  이용할 수 있습니다.
                </p>
                {Object.entries(terms).map(([key, value]) => {
                  if (key === "all") return null;
                  const labels = {
                    terms1: "이용약관 동의 (필수)",
                    terms2: "개인정보 이용 동의 (필수)",
                    terms3: "개인정보 이용 동의 (선택)",
                    terms4: "무료배송, 할인 쿠폰 등 혜택/정보 수신 동의 (선택)",
                    terms5: "본인은 만 14세 이상입니다. (필수)",
                  };
                  return (
                    <div key={key} className="ml-4 flex items-center space-x-2">
                      <Checkbox
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => {
                          handleSingleTerm(key, checked as boolean);
                        }}
                      />
                      <label htmlFor={key} className="text-sm leading-none">
                        {labels[key as keyof typeof labels]}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 가입하기 버튼 */}
            <Button
              className="mt-6 h-[46px] w-full bg-emerald-500 text-white hover:bg-emerald-600"
              onClick={handleSignup}
              disabled={isLoading}
            >
              가입하기
            </Button>
          </form>
        </div>
        <Footer />
      </div>
    </>
  );
}
