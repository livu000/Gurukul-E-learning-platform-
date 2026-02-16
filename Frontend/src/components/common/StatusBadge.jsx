function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = status.toLowerCase();

  const map = {
    draft: "badge badge-draft",
    review: "badge badge-review",
    published: "badge badge-published",

    pending: "badge badge-pending",
    graded: "badge badge-graded",

    success: "badge badge-success",
    failed: "badge badge-failed"
  };

  const className = map[normalized] || "badge";

  return (
    <span className={className}>
      {status}
    </span>
  );
}

export default StatusBadge;
