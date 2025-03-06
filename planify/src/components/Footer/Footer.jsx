import React from "react";
import "./Footer.css";

const locations = [
  {
    city: "HÀ NỘI",
    address:
      "Khu Giáo dục và Đào tạo – Khu Công nghệ cao Hòa Lạc – Km29 Đại lộ Thăng Long, H. Thạch Thất, TP. Hà Nội",
    phone: "(024) 7300 5588",
    email: "tuyensinh.hanoi@fpt.edu.vn",
  },
  {
    city: "TP. HỒ CHÍ MINH",
    address:
      "Lô E2a-7, Đường D1 Khu Công nghệ cao, P. Long Thạnh Mỹ, TP. Thủ Đức, TP. Hồ Chí Minh",
    phone: "(028) 7300 5588",
    email: "daihoc.hcm@fpt.edu.vn",
  },
  {
    city: "ĐÀ NẴNG",
    address:
      "Khu đô thị công nghệ FPT Đà Nẵng, P. Hoà Hải, Q. Ngũ Hành Sơn, TP. Đà Nẵng",
    phone: "(0236) 730 0999",
    email: "dnuni@fe.edu.vn",
  },
  {
    city: "CẦN THƠ",
    address:
      "Số 600 Đường Nguyễn Văn Cừ (nối dài), P. An Bình, Q. Ninh Kiều, TP. Cần Thơ",
    phone: "(0292) 730 3636",
    email: "fptu.cantho@fe.edu.vn",
  },
  {
    city: "QUY NHƠN",
    address:
      "Khu đô thị mới An Phú Thịnh, Phường Nhơn Bình & Phường Đống Đa, TP. Quy Nhơn, Bình Định",
    phone: "(0256) 7300 999",
    email: "qnuni@fe.edu.vn",
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer__copyright">
        © 2025 Bản quyền thuộc về Trường Đại học FPT.
      </p>

      <div className="footer__locations">
        {locations.map((loc, index) => (
          <div className="footer__location" key={index}>
            <h3 className="footer__city">{loc.city}</h3>
            <p>{loc.address}</p>
            <p>Điện thoại: {loc.phone}</p>
            <p>Email: {loc.email}</p>
          </div>
        ))}
      </div>
    </footer>
  );
}
