import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpg";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  ShoppingBag,
  Search,
  User,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { CATEGORIES } from "../data/categories";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { isAuthenticated, logout, user } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const { dark, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenu, setMegaMenu] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileExpanded, setMobileExpanded] = useState(null);

  const lastScrollY = useRef(0);
  const searchRef = useRef(null);

  // Scroll hide/show + transparency
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > lastScrollY.current && y > 120);
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
    setMegaMenu(null);
    setSearchOpen(false);
  }, [location]);

  // Focus search input
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/category/all?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isHome = location.pathname === "/";

  return (
    <>
      {/* ── Main Navbar ── */}
      <motion.header
        className={`${styles.navbar} ${scrolled ? styles.scrolled : ""} ${isHome && !scrolled ? styles.transparent : ""}`}
        animate={{ y: hidden ? -120 : 0 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Top row — logo center, actions right */}
        <div className={styles.navInner}>
          {/* Left — nav links (desktop) */}
          <nav className={styles.navLeft}>
            <Link to="/" className={styles.logo}>
              <img src={logo} alt="SVS Collection" className={styles.logoImg} />
            </Link>

            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className={styles.navItem}
                onMouseEnter={() => setMegaMenu(cat.id)}
                onMouseLeave={() => setMegaMenu(null)}
              >
                <Link to={`/category/${cat.id}`} className={styles.navLink}>
                  {cat.label}
                  <ChevronDown
                    size={12}
                    className={`${styles.chevron} ${megaMenu === cat.id ? styles.chevronUp : ""}`}
                  />
                </Link>
              </div>
            ))}
            <Link to="/category/all" className={styles.navLink}>
              All Products
            </Link>
            <Link to="/contact" className={styles.navLink}>
              Contact us
            </Link>
          </nav>

          {/* Center — Logo */}
          {/* <Link to="/" className={styles.logo}>
            <div className={styles.logoInner}>
            </div>
          </Link> */}

          {/* Right — actions */}
          <div className={styles.navRight}>
            <button
              className={styles.iconBtn}
              onClick={() => setSearchOpen((s) => !s)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {isAuthenticated ? (
              <div className={styles.userMenu}>
                <button className={styles.iconBtn} aria-label="Account">
                  <User size={20} />
                </button>
                <div className={styles.userDropdown}>
                  <span className={styles.userName}>Hi, {user?.username}</span>
                  <Link to="/orders" className={styles.dropdownItem}>
                    My Orders
                  </Link>
                  <button
                    onClick={handleLogout}
                    className={styles.dropdownItem}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className={styles.iconBtn} aria-label="Login">
                <User size={20} />
              </Link>
            )}
            <button
              className={styles.iconBtn}
              onClick={toggle}
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link to="/cart" className={styles.cartBtn} aria-label="Cart">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <motion.span
                  className={styles.cartBadge}
                  key={cartCount}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            <button
              className={styles.hamburger}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mega Menu ── */}
        <AnimatePresence>
          {megaMenu && (
            <motion.div
              className={styles.megaMenu}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={() => setMegaMenu(megaMenu)}
              onMouseLeave={() => setMegaMenu(null)}
            >
              {CATEGORIES.filter((c) => c.id === megaMenu).map((cat) => (
                <div key={cat.id} className={styles.megaInner}>
                  <div className={styles.megaLeft}>
                    <span className="section-eyebrow">{cat.label}</span>
                    <p className={styles.megaDesc}>{cat.description}</p>
                    <Link
                      to={`/category/${cat.id}`}
                      className="btn btn-outline"
                      style={{ marginTop: 16 }}
                    >
                      View All →
                    </Link>
                  </div>
                  <div className={styles.megaRight}>
                    {cat.subcategories.map((sub) => (
                      <div key={sub.id} className={styles.megaColumn}>
                        <h4 className={styles.megaColumnHead}>{sub.label}</h4>
                        {sub.items.map((item) => (
                          <Link
                            key={item.id}
                            to={`/category/${cat.id}/${item.id}`}
                            className={styles.megaLink}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Search overlay ── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className={styles.searchBar}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
            >
              <form onSubmit={handleSearch} className={styles.searchForm}>
                <Search size={18} style={{ color: "var(--text-muted)" }} />
                <input
                  ref={searchRef}
                  className={styles.searchInput}
                  placeholder="Search sarees, jewelry, pooja items…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="button" onClick={() => setSearchOpen(false)}>
                  <X size={18} style={{ color: "var(--text-muted)" }} />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className={styles.mobileOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className={styles.mobileMenu}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 280 }}
            >
              {/* Mobile logo */}
              <div className={styles.mobileHeader}>
                <span className={styles.logoSvs} style={{ fontSize: 24 }}>
                  SVS Collection
                </span>
                <button onClick={() => setMobileOpen(false)}>
                  <X size={22} />
                </button>
              </div>

              {/* Mobile search */}
              <form onSubmit={handleSearch} className={styles.mobileSearch}>
                <Search size={16} />
                <input
                  placeholder="Search…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>

              {/* Mobile nav */}
              <nav className={styles.mobileNav}>
                {CATEGORIES.map((cat) => (
                  <div key={cat.id}>
                    <button
                      className={styles.mobileNavItem}
                      onClick={() =>
                        setMobileExpanded(
                          mobileExpanded === cat.id ? null : cat.id,
                        )
                      }
                    >
                      <span>
                        {cat.icon} {cat.label}
                      </span>
                      <ChevronDown
                        size={16}
                        style={{
                          transform:
                            mobileExpanded === cat.id
                              ? "rotate(180deg)"
                              : "none",
                          transition: "transform 0.2s",
                        }}
                      />
                    </button>
                    <AnimatePresence>
                      {mobileExpanded === cat.id && (
                        <motion.div
                          className={styles.mobileSub}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                        >
                          <Link
                            to={`/category/${cat.id}`}
                            className={styles.mobileSubLink}
                            style={{ fontWeight: 600, color: "var(--maroon)" }}
                          >
                            All {cat.label}
                          </Link>
                          {cat.subcategories
                            .flatMap((sub) => sub.items)
                            .map((item) => (
                              <Link
                                key={item.id}
                                to={`/category/${cat.id}/${item.id}`}
                                className={styles.mobileSubLink}
                              >
                                {item.label}
                              </Link>
                            ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <Link to="/category/all" className={styles.mobileNavItem}>
                  All Products
                </Link>

                <div className={styles.mobileDivider} />

                {isAuthenticated ? (
                  <>
                    <Link to="/orders" className={styles.mobileNavItem}>
                      My Orders
                    </Link>
                    <Link to="/cart" className={styles.mobileNavItem}>
                      Cart ({cartCount})
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={styles.mobileNavItem}
                      style={{
                        color: "var(--maroon)",
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className={styles.mobileNavItem}>
                      Login
                    </Link>
                    <Link to="/signup" className={styles.mobileNavItem}>
                      Create Account
                    </Link>
                  </>
                )}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
