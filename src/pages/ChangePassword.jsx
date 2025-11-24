import React, { useState } from "react";
import useAuthStore from "../store/authStore";
import api from "../services/api";

const ChangePassword = () => {
  const token = useAuthStore((state) => state.token);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return setError("모든 비밀번호 입력란을 채워주세요.");
    }

    if (newPassword !== confirmNewPassword) {
      return setError("새 비밀번호가 서로 일치하지 않습니다.");
    }

    try {
      const res = await api.put(
        "/auth/change-password",
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage("비밀번호가 성공적으로 변경되었습니다!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "비밀번호 변경 중 오류가 발생했습니다."
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">비밀번호 변경</h2>

        {message && (
          <div className="text-green-600 text-center mb-4">{message}</div>
        )}
        {error && <div className="text-red-600 text-center mb-4">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium mb-1">현재 비밀번호</label>
            <input
              type="password"
              className="w-full border p-2 rounded"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="현재 비밀번호 입력"
            />
          </div>

          <div className="mb-4">
            <label className="block font-medium mb-1">새 비밀번호</label>
            <input
              type="password"
              className="w-full border p-2 rounded"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호 입력"
            />
          </div>

          <div className="mb-6">
            <label className="block font-medium mb-1">새 비밀번호 확인</label>
            <input
              type="password"
              className="w-full border p-2 rounded"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              placeholder="새 비밀번호 재입력"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            변경하기
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
