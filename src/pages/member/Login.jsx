import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import supabase from "../../utils/supabase";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    pw: "",
  });
  const [loginMsg, setLoginMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    setLoginMsg(""); // 메시지 초기화

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.pw,
    });

    if (error) {
      console.error("로그인 실패:", error.message);
      setLoginMsg(`로그인 실패: ${error.message}`);
    } else {
      setLoginMsg("로그인 성공!");
      navigate("/"); // 로그인 성공 시 홈 또는 원하는 페이지로 이동
    }
  };
  return (
    <div>
      <h1>
        <Link to="/">LOGO</Link>
      </h1>

      <div className="flex justify-center items-center h-screen">
        <div className="w-[300px] border-1 border-gray-300 rounded-md p-6 shadow-md">
          <h2 className="text-2xl font-bold">로그인</h2>
          <div className="flex w-full flex-col gap-2 ">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">이메일</legend>
              <input
                type="text"
                className="input"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="아이디를 입력하세요"
              />
            </fieldset>
            <fieldset className="fieldset">
              <legend className="fieldset-legend">PW</legend>
              <input
                type="text"
                className="input"
                name="pw"
                value={formData.pw}
                onChange={handleChange}
                placeholder="패스워드를 입력하세요"
              />
            </fieldset>
            {loginMsg && <p className="text-sm text-red-500">{loginMsg}</p>}
            <div>
              <button className="btn btn-primary w-full" onClick={handleLogin}>
                로그인
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
