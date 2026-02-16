function PageHeader({ title, action }) {
  return (
    <div className="page-header">
      <h2 className="page-title">{title}</h2>

      {action && (
        <div className="page-action">
          {action}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
