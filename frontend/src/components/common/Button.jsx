import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function Button({ to, children, variant = "primary", type = "button", onClick, className = "" }) {
  const content = <motion.span className={`button-inner ${variant} ${className}`} whileHover={{ y: -3, scale: 1.025 }} whileTap={{ scale: .96 }}>
    {children} <ArrowUpRight size={17} />
  </motion.span>;
  return to ? <Link className="button-link" to={to}>{content}</Link> : <button type={type} className="button-reset" onClick={onClick}>{content}</button>;
}
