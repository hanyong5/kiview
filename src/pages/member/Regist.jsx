import React, { useState } from "react";
import { Link } from "react-router-dom";
import bcrypt from "bcryptjs";
import supabase from "../../utils/supabase";

function Regist() {
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    pw: "",
  });
  const [phoneCheckMsg, setPhoneCheckMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignUp = async () => {
    // const hashedPw = await bcrypt.hash(formData.pw, 10);
    // console.log("해시된 PW:", hashedPw);

    // await supabase.from("users").insert([
    //   {
    //     phone: formData.phone,
    //     name: formData.name,
    //     password_hash: hashedPw,
    //   },
    // ]);

    const { user, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.pw,
      options: {
        data: {
          name: formData.name, // 사용자 추가 정보 metadata 로 저장
          phone: formData.phone,
        },
      },
    });

    if (error) {
      console.error("회원가입 실패:", error.message);
      alert(`회원가입 실패: ${error.message}`);
    } else {
      alert("회원가입 성공! 인증 절차를 완료하세요.");
      console.log("가입된 유저:", user);
    }
  };

  // const checkPhoneDuplicate = async (phone) => {
  //   if (!phone) return;

  //   const { data: existingUser, error } = await supabase
  //     .from("users")
  //     .select("id")
  //     .eq("phone", phone)
  //     .maybeSingle();

  //   if (error) {
  //     console.error("전화번호 중복 체크 에러:", error);
  //     setPhoneCheckMsg("에러 발생");
  //     return;
  //   }

  //   if (existingUser) {
  //     setPhoneCheckMsg("이미 등록된 번호입니다.");
  //   } else {
  //     setPhoneCheckMsg("사용 가능한 번호입니다.");
  //     // 다른 필드들을 활성화
  //   }
  // };

  return (
    <div>
      <h1>
        <Link to="/">LOGO</Link>
      </h1>
      <div>
        {formData?.phone}
        {formData?.name}
        {formData?.pw}
      </div>

      <div className="flex justify-center items-center h-screen">
        <div className="w-[300px] border-1 border-gray-300 rounded-md p-6 shadow-md">
          <h2>회원가입</h2>
          <div className="flex w-full flex-col gap-2 ">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">이메일</legend>
              <input
                type="text"
                className="input"
                name="email"
                placeholder="이메일을 입력하세요"
                onChange={handleChange}
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">전화번호</legend>
              <input
                type="text"
                className="input"
                name="phone"
                placeholder="전화번호를 입력하세요"
                onChange={handleChange}
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">이름</legend>
              <input
                type="text"
                className="input"
                name="name"
                placeholder="이름을 입력하세요"
                onChange={handleChange}
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">PW</legend>
              <input
                type="text"
                className="input"
                name="pw"
                placeholder="패스워드를 입력하세요"
                onChange={handleChange}
              />
            </fieldset>
            <div>
              <button className="btn btn-primary w-full" onClick={handleSignUp}>
                회원가입
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Regist;
