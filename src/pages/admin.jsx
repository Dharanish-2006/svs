// src/pages/admin.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  TrendingUp,
  Clock,
  Package,
  ChevronDown,
  RefreshCw,
  Wifi,
  WifiOff,
  Search,
  ArrowUpRight,
  Filter,
  Bell,
  BellOff,
  Plus,
  X,
  Upload,
  Tag,
  Image,
  DollarSign,
  AlignLeft,
  CheckCircle,
  Layers,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../utils/api";
import { useAdminWS } from "../features/admin/hooks/useAdminSocket";
import styles from "./Admin.module.css";
import formStyles from "./AdminForm.module.css";

const STATUS_CONFIG = {
  PLACED: { label: "Placed", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  PAID: { label: "Paid", color: "#6366f1", bg: "rgba(99,102,241,0.12)" },
  SHIPPED: { label: "Shipped", color: "#3b82f6", bg: "rgba(59,130,246,0.12)" },
  DELIVERED: {
    label: "Delivered",
    color: "#10b981",
    bg: "rgba(16,185,129,0.12)",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
  },
};
const ALL_STATUSES = Object.keys(STATUS_CONFIG);

function useNotifications() {
  const [notifs, setNotifs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("admin_notifs") || "[]");
    } catch {
      return [];
    }
  });
  const [unread, setUnread] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    setUnread(notifs.filter((n) => !n.read).length);
  }, [notifs]);

  const add = useCallback((data) => {
    const entry = {
      ...data,
      id: Date.now(),
      read: false,
      ts: new Date().toISOString(),
    };
    setNotifs((prev) => {
      const next = [entry, ...prev].slice(0, 50);
      localStorage.setItem("admin_notifs", JSON.stringify(next));
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifs((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      localStorage.setItem("admin_notifs", JSON.stringify(next));
      return next;
    });
    setUnread(0);
  }, []);

  return {
    notifs,
    unread,
    panelOpen,
    openPanel: () => {
      setPanelOpen(true);
      markAllRead();
    },
    closePanel: () => setPanelOpen(false),
    add,
  };
}

// ── Product Create Form ────────────────────────────────────────────────────────
function ProductCreateForm({ onSuccess, onClose, editProduct }) {
  const [form, setForm] = useState({
    product_name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
  });

  const [images, setImages] = useState([]); // additional images (File[])
  const [mainImage, setMainImage] = useState(null); // main image (File)
  const [previews, setPreviews] = useState([]);
  const [mainPreview, setMainPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const mainImageRef = useRef(null);
  const addlImageRef = useRef(null);

  useEffect(() => {
    if (editProduct) {
      setForm({
        product_name: editProduct.product_name,
        description: editProduct.description,
        price: editProduct.price,
        category: editProduct.category?.id || "",
        stock: editProduct.stock || "",
      });

      setMainPreview(editProduct.image); // show existing image
    }
  }, [editProduct]);

  useEffect(() => {
    // Fetch categories from backend
    api
      .get("/api/admin/categories/")
      .then((r) => setCategories(r.data || []))
      .catch(() => {});
  }, []);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleMainImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMainImage(file);
    const url = URL.createObjectURL(file);
    setMainPreview(url);
  };

  const handleAddlImages = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews((prev) => [...prev, ...urls]);
  };

  const removeAddlImage = (idx) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    if (!form.product_name.trim()) {
      toast.error("Product name is required");
      return false;
    }
    if (!form.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) {
      toast.error("Valid price is required");
      return false;
    }
    if (!mainImage && !editProduct) {
      toast.error("Main product image is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const fd = new FormData();

      fd.append("product_name", form.product_name.trim());
      fd.append("description", form.description.trim());
      fd.append("price", form.price);
      fd.append("stock", form.stock || "0");

      if (form.category) {
        fd.append("category_id", Number(form.category));
      }
      fd.append("images", mainImage);
      images.forEach((img) => fd.append("images", img));
      if (editProduct) {
        await api.patch(`/api/admin/products/${editProduct.id}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product updated!");
      } else {
        await api.post("/api/admin/products/create/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Product created!");
      }
      toast.success("Product created successfully!");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className={formStyles.drawer}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 260 }}
    >
      <div className={formStyles.drawerHeader}>
        <div className={formStyles.drawerTitle}>
          <div
            className={formStyles.drawerIcon}
            style={{
              background: "rgba(201,151,58,0.15)",
              color: "var(--gold)",
            }}
          >
            <Package size={18} />
          </div>
          <h2>Create Product</h2>
        </div>
        <button className={formStyles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className={formStyles.form}>
        {/* Product Name */}
        <div className={formStyles.field}>
          <label className={formStyles.label}>
            <Tag size={14} /> Product Name{" "}
            <span className={formStyles.req}>*</span>
          </label>
          <input
            name="product_name"
            className={formStyles.input}
            placeholder="e.g. Kanjivaram Silk Saree"
            value={form.product_name}
            onChange={handleChange}
            required
          />
        </div>

        {/* Description */}
        <div className={formStyles.field}>
          <label className={formStyles.label}>
            <AlignLeft size={14} /> Description{" "}
            <span className={formStyles.req}>*</span>
          </label>
          <textarea
            name="description"
            className={formStyles.textarea}
            placeholder="Describe the product in detail..."
            value={form.description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        {/* Price + Stock row */}
        <div className={formStyles.row}>
          <div className={formStyles.field}>
            <label className={formStyles.label}>
              <DollarSign size={14} /> Price (₹){" "}
              <span className={formStyles.req}>*</span>
            </label>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              className={formStyles.input}
              placeholder="e.g. 1299"
              value={form.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className={formStyles.field}>
            <label className={formStyles.label}>
              <Layers size={14} /> Stock Quantity
            </label>
            <input
              name="stock"
              type="number"
              min="0"
              className={formStyles.input}
              placeholder="e.g. 50"
              value={form.stock}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Category */}
        <div className={formStyles.field}>
          <label className={formStyles.label}>
            <Tag size={14} /> Category
          </label>
          <div className={formStyles.selectWrap}>
            <select
              name="category"
              className={formStyles.select}
              value={form.category}
              onChange={handleChange}
            >
              <option value="">— Select category (optional) —</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className={formStyles.selectArrow} />
          </div>
        </div>

        {/* Main Image */}
        <div className={formStyles.field}>
          <label className={formStyles.label}>
            <Image size={14} /> Main Image{" "}
            <span className={formStyles.req}>*</span>
          </label>
          <div
            className={`${formStyles.imageUpload} ${mainPreview ? formStyles.imageUploaded : ""}`}
            onClick={() => mainImageRef.current?.click()}
          >
            {mainPreview ? (
              <div className={formStyles.imagePreviewMain}>
                <img src={mainPreview} alt="preview" />
                <div className={formStyles.imageOverlay}>
                  <Upload size={20} />
                  <span>Change image</span>
                </div>
              </div>
            ) : (
              <div className={formStyles.imageUploadEmpty}>
                <Upload size={28} />
                <span>Click to upload main image</span>
                <small>JPG, PNG, WebP • Max 10MB</small>
              </div>
            )}
            <input
              ref={mainImageRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleMainImage}
            />
          </div>
        </div>

        {/* Additional Images */}
        <div className={formStyles.field}>
          <label className={formStyles.label}>
            <Image size={14} /> Additional Images
            <span className={formStyles.hint}>(shown in gallery carousel)</span>
          </label>
          <div className={formStyles.addlGrid}>
            {previews.map((url, i) => (
              <div key={i} className={formStyles.addlThumb}>
                <img src={url} alt="" />
                <button
                  type="button"
                  className={formStyles.removeThumb}
                  onClick={() => removeAddlImage(i)}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <div
              className={formStyles.addlUpload}
              onClick={() => addlImageRef.current?.click()}
            >
              <Plus size={22} />
              <span>Add</span>
              <input
                ref={addlImageRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={handleAddlImages}
              />
            </div>
          </div>
          {images.length > 0 && (
            <p className={formStyles.imageCount}>
              {images.length} additional image{images.length !== 1 ? "s" : ""}{" "}
              selected
            </p>
          )}
        </div>

        <div className={formStyles.formActions}>
          <button
            type="button"
            className={formStyles.cancelBtn}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={formStyles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <span className={formStyles.spinner} />
            ) : (
              <>
                <CheckCircle size={16} /> Create Product
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ── Category Create Form ───────────────────────────────────────────────────────
function CategoryCreateForm({ onSuccess, onClose }) {
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setLoading(true);
    try {
      await api.post("/api/admin/categories/create/", form);
      toast.success("Category created!");
      onSuccess?.();
      onClose?.();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className={formStyles.drawer}
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 260 }}
    >
      <div className={formStyles.drawerHeader}>
        <div className={formStyles.drawerTitle}>
          <div
            className={formStyles.drawerIcon}
            style={{
              background: "rgba(107,39,55,0.15)",
              color: "var(--maroon)",
            }}
          >
            <Tag size={18} />
          </div>
          <h2>Create Category</h2>
        </div>
        <button className={formStyles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className={formStyles.form}>
        <div className={formStyles.field}>
          <label className={formStyles.label}>
            <Tag size={14} /> Category Name{" "}
            <span className={formStyles.req}>*</span>
          </label>
          <input
            name="name"
            className={formStyles.input}
            placeholder="e.g. Silk Sarees"
            value={form.name}
            onChange={handleChange}
            required
            autoFocus
          />
        </div>

        <div className={formStyles.field}>
          <label className={formStyles.label}>
            <AlignLeft size={14} /> Description
          </label>
          <textarea
            name="description"
            className={formStyles.textarea}
            placeholder="Brief description of this category..."
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
        </div>

        <div className={formStyles.formActions}>
          <button
            type="button"
            className={formStyles.cancelBtn}
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={formStyles.submitBtn}
            disabled={loading}
          >
            {loading ? (
              <span className={formStyles.spinner} />
            ) : (
              <>
                <CheckCircle size={16} /> Create Category
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}

// ── Main Admin Page ────────────────────────────────────────────────────────────
export default function Admin() {
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [products, setProducts] = useState([]);
  const [stockEdit, setStockEdit] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [drawerMode, setDrawerMode] = useState(null); // 'product' | 'category' | null
  const [editProduct, setEditProduct] = useState(null);
  const notifications = useNotifications();

  const fetchOrders = useCallback(
    async (silent = false) => {
      silent ? setRefreshing(true) : setLoading(true);
      try {
        const url = statusFilter
          ? `/api/admin/orders/?status=${statusFilter}`
          : "/api/admin/orders/";
        const res = await api.get(url);
        setOrders(res.data || []);
      } catch {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get("/api/admin/products/");
      setProducts(res.data || []);
    } catch {
      toast.error("Failed to load products");
    }
  }, []);

  useEffect(() => {
    if (tab === "inventory") fetchProducts();
  }, [tab, fetchProducts]);

  const handleNewOrder = useCallback(
    (data) => {
      notifications.add(data);
      toast.custom(
        (t) => (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            className={styles.orderToast}
          >
            <span style={{ fontSize: 22 }}>🛒</span>
            <div>
              <div className={styles.toastTitle}>
                New Order #{data.order_id}
              </div>
              <div className={styles.toastSub}>
                ₹{data.amount} · {data.customer}
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className={styles.toastClose}
            >
              ✕
            </button>
          </motion.div>
        ),
        { duration: 8000 },
      );
      fetchOrders(true);
    },
    [notifications, fetchOrders],
  );

  const wsConnected = useAdminWS(handleNewOrder);

  const updateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/api/admin/orders/${orderId}/status/`, {
        status: newStatus,
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      toast.success(`Order #${orderId} → ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const updateStock = async (productId) => {
    const val = stockEdit[productId];
    if (val === undefined || val === "") return;
    setSavingId(productId);
    try {
      await api.patch(`/api/admin/products/${productId}/stock/`, {
        stock: Number(val),
      });
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId
            ? { ...p, stock: Number(val), is_in_stock: Number(val) > 0 }
            : p,
        ),
      );
      setStockEdit((prev) => {
        const n = { ...prev };
        delete n[productId];
        return n;
      });
      toast.success("Stock updated");
    } catch {
      toast.error("Failed to update stock");
    } finally {
      setSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure?")) return;

    try {
      await api.delete(`/api/admin/products/${id}/`);
      toast.success("Product deleted");
      fetchProducts();
    } catch {
      toast.error("Delete failed");
    }
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(o.id).includes(q) || o.user?.username?.toLowerCase().includes(q)
    );
  });

  const stats = {
    total: orders.length,
    revenue: orders.reduce((s, o) => s + Number(o.total_amount), 0),
    pending: orders.filter((o) => o.status === "PLACED").length,
    today: orders.filter((o) => {
      const d = new Date(o.created_at),
        n = new Date();
      return d.getDate() === n.getDate() && d.getMonth() === n.getMonth();
    }).length,
  };

  return (
    <div className={styles.page}>
      {/* Drawer overlay */}
      <AnimatePresence>
        {drawerMode && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerMode(null)}
            />
            {drawerMode === "product" && (
              <ProductCreateForm
                editProduct={editProduct}
                onClose={() => {
                  setDrawerMode(null);
                  setEditProduct(null);
                }}
                onSuccess={() => {
                  if (tab === "inventory") fetchProducts();
                }}
              />
            )}
            {drawerMode === "category" && (
              <CategoryCreateForm
                onClose={() => setDrawerMode(null)}
                onSuccess={() => {}}
              />
            )}
          </>
        )}
      </AnimatePresence>

      {/* Notification panel */}
      <AnimatePresence>
        {notifications.panelOpen && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={notifications.closePanel}
            />
            <motion.aside
              className={styles.notifPanel}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
            >
              <div className={styles.notifHeader}>
                <h2>Notifications</h2>
                <button
                  onClick={notifications.closePanel}
                  className={styles.closeBtn}
                >
                  ✕
                </button>
              </div>
              <div className={styles.notifList}>
                {notifications.notifs.length === 0 ? (
                  <div className={styles.notifEmpty}>No notifications yet</div>
                ) : (
                  notifications.notifs.map((n) => (
                    <div
                      key={n.id}
                      className={`${styles.notifItem} ${n.read ? styles.notifRead : ""}`}
                    >
                      <div className={styles.notifDot} />
                      <div>
                        <div className={styles.notifTitle}>
                          Order #{n.order_id}
                        </div>
                        <div className={styles.notifSub}>
                          ₹{n.amount} · {n.customer}
                        </div>
                        <div className={styles.notifTime}>
                          {new Date(n.ts).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className={styles.inner}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>
              Manage orders, products and categories
            </p>
          </div>
          <div className={styles.headerRight}>
            {/* Create buttons */}
            <button
              className={styles.createBtn}
              onClick={() => setDrawerMode("category")}
              title="Create new category"
            >
              <Tag size={15} /> Category
            </button>
            <button
              className={`${styles.createBtn} ${styles.createBtnPrimary}`}
              onClick={() => setDrawerMode("product")}
              title="Create new product"
            >
              <Plus size={15} /> Product
            </button>

            <div
              className={`${styles.wsStatus} ${wsConnected ? styles.wsOn : styles.wsOff}`}
            >
              {wsConnected ? (
                <>
                  <Wifi size={13} /> Live
                </>
              ) : (
                <>
                  <WifiOff size={13} /> Offline
                </>
              )}
            </div>
            <button
              className={styles.iconBtn}
              onClick={() => fetchOrders(true)}
              disabled={refreshing}
            >
              <RefreshCw
                size={16}
                className={refreshing ? styles.spinning : ""}
              />
            </button>
            <button
              className={styles.bellBtn}
              onClick={notifications.openPanel}
            >
              {notifications.unread > 0 ? (
                <Bell size={18} />
              ) : (
                <BellOff size={18} />
              )}
              {notifications.unread > 0 && (
                <motion.span
                  className={styles.badge}
                  key={notifications.unread}
                  initial={{ scale: 1.6 }}
                  animate={{ scale: 1 }}
                >
                  {notifications.unread > 9 ? "9+" : notifications.unread}
                </motion.span>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          {[
            {
              label: "Total Orders",
              value: stats.total,
              icon: <ShoppingBag size={18} />,
              accent: "#6366f1",
            },
            {
              label: "Revenue",
              value: `₹${stats.revenue.toLocaleString("en-IN")}`,
              icon: <TrendingUp size={18} />,
              accent: "#10b981",
            },
            {
              label: "New Today",
              value: stats.today,
              icon: <ArrowUpRight size={18} />,
              accent: "#f59e0b",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: <Clock size={18} />,
              accent: "#ef4444",
            },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              className={styles.statCard}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div
                className={styles.statIcon}
                style={{ color: s.accent, background: s.accent + "18" }}
              >
                {s.icon}
              </div>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className={styles.tabRow}>
          {[
            ["orders", "Orders"],
            ["inventory", "Inventory"],
          ].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`${styles.tabBtn} ${tab === key ? styles.tabActive : ""}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ══ ORDERS ══ */}
        {tab === "orders" && (
          <>
            <div className={styles.toolbar}>
              <div className={styles.searchWrap}>
                <Search size={14} className={styles.searchIcon} />
                <input
                  className={styles.searchInput}
                  placeholder="Search by order ID or customer…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className={styles.filters}>
                <Filter size={13} style={{ color: "var(--text-muted)" }} />
                {["", ...ALL_STATUSES].map((s) => (
                  <button
                    key={s}
                    className={`${styles.filterBtn} ${statusFilter === s ? styles.filterActive : ""}`}
                    onClick={() => setStatusFilter(s)}
                    style={
                      statusFilter === s && s
                        ? {
                            background: STATUS_CONFIG[s].bg,
                            color: STATUS_CONFIG[s].color,
                            borderColor: STATUS_CONFIG[s].color + "55",
                          }
                        : {}
                    }
                  >
                    {s || "All"}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className={styles.loadWrap}>
                <div className={styles.loader} />
              </div>
            ) : (
              <motion.div
                className={styles.tableWrap}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {[
                        "Order",
                        "Customer name",
                        "Items",
                        "Total",
                        "address",
                        "Date",
                        "Status",
                        "Update",
                      ].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence initial={false}>
                      {filtered.map((order, i) => {
                        const sc = STATUS_CONFIG[order.status] || {
                          label: order.status,
                          color: "#888",
                          bg: "#8882",
                        };
                        return (
                          <motion.tr
                            key={order.id}
                            className={styles.row}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ delay: i * 0.03 }}
                          >
                            <td>
                              <span className={styles.orderId}>
                                #{order.id}
                              </span>
                            </td>
                            <td>
                              <div className={styles.customer}>
                                <div className={styles.avatar}>
                                  {(order.full_name ||
                                    "?")[0].toUpperCase()}
                                </div>
                                <span>{order.full_name}</span>
                              </div>
                            </td>
                            <td className={styles.muted}>
                              {order.items?.length ?? 0} item
                              {order.items?.length !== 1 ? "s" : ""}
                            </td>
                            <td className={styles.amount}>
                              ₹
                              {order.total_amount}
                            </td>
                            <td className={styles.amount}>
                              ₹
                              {order.address}
                            </td>
                            <td className={styles.muted}>
                              {new Date(order.created_at).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </td>
                            <td>
                              <span
                                className={styles.statusPill}
                                style={{ background: sc.bg, color: sc.color }}
                              >
                                {sc.label}
                              </span>
                            </td>
                            <td>

                              <div className={styles.selectWrap}>
                                <select
                                  value={order.status}
                                  onChange={(e) =>
                                    updateStatus(order.id, e.target.value)
                                  }
                                  disabled={updatingId === order.id}
                                  className={styles.select}
                                >
                                  {ALL_STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                      {STATUS_CONFIG[s].label}
                                    </option>
                                  ))}
                                </select>
                                <ChevronDown
                                  size={12}
                                  className={styles.selectArrow}
                                />
                                {updatingId === order.id && (
                                  <div className={styles.miniLoader} />
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={8} className={styles.empty}>
                          <Package
                            size={32}
                            style={{ marginBottom: 8, opacity: 0.3 }}
                          />
                          <div>No orders found</div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </motion.div>
            )}
          </>
        )}

        {/* ══ INVENTORY ══ */}
        {tab === "inventory" && (
          <>
            <div className={styles.toolbar} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 14, color: "var(--text-muted)", flex: 1 }}>
                {products.length} product{products.length !== 1 ? "s" : ""}
              </p>
              <button
                className={`${styles.createBtn} ${styles.createBtnPrimary}`}
                onClick={() => setDrawerMode("product")}
              >
                <Plus size={15} /> Add Product
              </button>
            </div>
            <motion.div
              className={styles.tableWrap}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <table className={styles.table}>
                <thead>
                  <tr>
                    {[
                      "Product",
                      "Price",
                      "Current Stock",
                      "Status",
                      "Update Stock",
                    ].map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <motion.tr
                      key={p.id}
                      className={styles.row}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <td>
                        <div className={styles.customer}>
                          {p.image && (
                            <img
                              src={p.image}
                              alt={p.product_name}
                              style={{
                                width: 36,
                                height: 36,
                                borderRadius: 8,
                                objectFit: "cover",
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <span style={{ fontWeight: 600 }}>
                            {p.product_name}
                          </span>
                        </div>
                      </td>
                      <td className={styles.amount}>
                        ₹{p.price?.toLocaleString("en-IN")}
                      </td>
                      <td>
                        <span
                          style={{
                            fontFamily: "var(--font-display)",
                            fontSize: 20,
                            fontWeight: 800,
                            color:
                              p.stock === 0
                                ? "#ef4444"
                                : p.stock < 5
                                  ? "#f59e0b"
                                  : "#10b981",
                          }}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td>
                        <span
                          className={styles.statusPill}
                          style={{
                            background: p.is_in_stock
                              ? "rgba(16,185,129,0.12)"
                              : "rgba(239,68,68,0.12)",
                            color: p.is_in_stock ? "#10b981" : "#ef4444",
                          }}
                        >
                          {p.is_in_stock ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="number"
                            min="0"
                            placeholder={String(p.stock)}
                            value={stockEdit[p.id] ?? ""}
                            onChange={(e) =>
                              setStockEdit((prev) => ({
                                ...prev,
                                [p.id]: e.target.value,
                              }))
                            }
                            className={styles.stockInput}
                          />
                          <button
                            onClick={() => updateStock(p.id)}
                            disabled={savingId === p.id || !stockEdit[p.id]}
                            className={styles.saveBtn}
                            style={{ opacity: !stockEdit[p.id] ? 0.4 : 1 }}
                          >
                            {savingId === p.id ? "…" : "Save"}
                          </button>

                          <button
                            onClick={() => handleDelete(p.id)}
                            className={styles.deleteBtn}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => {
                              setEditProduct(p);
                              setDrawerMode("product");
                            }}
                            className={styles.saveBtn}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} className={styles.empty}>
                        <Package
                          size={32}
                          style={{ marginBottom: 8, opacity: 0.3 }}
                        />
                        <div>No products found</div>
                        <button
                          className={`${styles.createBtn} ${styles.createBtnPrimary}`}
                          style={{ marginTop: 12 }}
                          onClick={() => setDrawerMode("product")}
                        >
                          <Plus size={14} /> Add First Product
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
