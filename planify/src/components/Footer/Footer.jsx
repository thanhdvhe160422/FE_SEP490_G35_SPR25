import React from "react";
import "./Footer.css";

const locations = [
  {
    city: "HANOI",
    address:
      "Education and Training Area – Hoa Lac Hi-Tech Park – Km29 Thang Long Boulevard, Thach That District, Hanoi City",
    phone: "(024) 7300 5588",
    email: "tuyensinh.hanoi@fpt.edu.vn",
  },
  {
    city: "HO CHI MINH CITY",
    address:
      "Lot E2a-7, D1 Street, Hi-Tech Park, Long Thanh My Ward, Thu Duc City, Ho Chi Minh City",
    phone: "(028) 7300 5588",
    email: "daihoc.hcm@fpt.edu.vn",
  },
  {
    city: "DA NANG",
    address:
      "FPT Da Nang Urban Area, Hoa Hai Ward, Ngu Hanh Son District, Da Nang City",
    phone: "(0236) 730 0999",
    email: "dnuni@fe.edu.vn",
  },
  {
    city: "CAN THO",
    address:
      "600 Nguyen Van Cu Street (extended), An Binh Ward, Ninh Kieu District, Can Tho City",
    phone: "(0292) 730 3636",
    email: "fptu.cantho@fe.edu.vn",
  },
  {
    city: "QUY NHON",
    address:
      "An Phu Thinh New Urban Area, Nhon Binh Ward & Dong Da Ward, Quy Nhon City, Binh Dinh Province",
    phone: "(0256) 7300 999",
    email: "qnuni@fe.edu.vn",
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <p className="footer__copyright">
        © 2025 Copyright belongs to FPT University.
      </p>

      <div className="footer__locations">
        {locations.map((loc, index) => (
          <div className="footer__location" key={index}>
            <h3 className="footer__city">{loc.city}</h3>
            <p>{loc.address}</p>
            <p>Phone: {loc.phone}</p>
            <p>Email: {loc.email}</p>
          </div>
        ))}
      </div>
    </footer>
  );
}