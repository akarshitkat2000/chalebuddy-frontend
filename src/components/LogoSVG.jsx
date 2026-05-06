// src/components/LogoSVG.jsx
const LogoSVG = ({ height = 44 }) => (
  <img
    src="/logo3.png"
    alt="Chale Buddy"
    style={{ height:130, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)" }}
    onError={e => {
      e.target.style.display = "none";
      if (e.target.nextSibling) e.target.nextSibling.style.display = "block";
    }}
  />
);

export default LogoSVG;
