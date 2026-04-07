function BrandLogo({
  size = 'md',
  subtitle,
  title = 'Gurukul',
  tone = 'default',
  showText = true,
  className = ''
}) {
  const classes = ['brand-lockup', `brand-lockup--${size}`];

  if (tone === 'inverse') {
    classes.push('brand-lockup--inverse');
  }

  if (className) {
    classes.push(className);
  }

  return (
    <span className={classes.join(' ')}>
      <img className="brand-logo" src="/gurukul-logo.svg" alt="Gurukul logo" />
      {showText ? (
        <span className="brand-copy">
          <strong>{title}</strong>
          {subtitle ? <small>{subtitle}</small> : null}
        </span>
      ) : null}
    </span>
  );
}

export default BrandLogo;
