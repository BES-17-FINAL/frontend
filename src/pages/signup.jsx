import React, { useState } from 'react';
import useAuthStore from '../store/authStore';

function Signup() {
  const [form, setForm] = useState({
    username: "",
    user_name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    

    useAuthStore.getState().register(form)
      .then((data) => {
        console.log("회원가입 성공:", data);
        // 회원가입 성공 후 처리 (예: 로그인 페이지로 이동)
      })
      .catch((err) => {
        console.error("회원가입 실패:", err);
        // 회원가입 실패 후 처리 (예: 에러 메시지 표시)
      });

    // 실제 회원가입 API 요청 코드 작성 위치
  };


  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-indigo-500 to-sky-400">
      <div className="max-w-[420px] space-y-6 my-12">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl px-12 py-14">
          <h1 className="text-center mb-6">
            <span className="text-4xl bg-indigo-500 bg-clip-text text-transparent">
              회원가입
            </span>
          </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
          <input
          type="text"
          name="username"
          placeholder="username"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="text"
          name="user_name"
          placeholder="user_name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="email"
          name="email"
          placeholder="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="password"
          name="password"
          placeholder="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-200"
        >
          회원가입
        </button>

      </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
