import { AlertCircle, Check, X } from "lucide-react";
import { useCart } from "../context/useCart";

function ToastViewport() {
  const { toasts, dismissToast } = useCart();
  return (
    <div className="toast-viewport" aria-live="polite" aria-atomic="false">
      {toasts.map(toast => (
        <div className={`toast toast-${toast.kind}`} key={toast.id} role="status">
          {toast.kind === "error" ? <AlertCircle size={17} /> : <Check size={17} />}
          <span>{toast.message}</span>
          <button type="button" aria-label="Dismiss notification" onClick={() => dismissToast(toast.id)}>
            <X size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastViewport;
