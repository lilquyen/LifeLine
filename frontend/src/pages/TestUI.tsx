import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card"
import { Calendar } from "../components/ui/calendar"
import React from "react";

const TestUI = () => {
  return (
    <div className="p-10">
      <Card className="w-[350px] p-5">
        <h2 className="text-xl font-bold mb-4">Đây là một Card</h2>
        <p className="mb-4">Nội dung bên trong card. Đây là một đoạn văn bản mẫu để kiểm tra giao diện.</p>
        <Button variant="destructive">Nút Đỏ</Button>
      </Card>
    </div>
  )
}

export default TestUI;