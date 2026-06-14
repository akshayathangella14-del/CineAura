// import './CineAuraLoader.css';

const CineAuraLoader = ({ variant = 'page' }) => {
  // variants: 'page', 'inline', 'card'
  
  if (variant === 'page') {
    return (
      <div className="cineaura-loader__page-overlay">
        <div className="cineaura-loader__container">
          <div className="cineaura-loader__ring"></div>
          <div className="cineaura-loader__pulse"></div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="cineaura-loader__card">
        <div className="cineaura-loader__ring cineaura-loader__ring--small"></div>
      </div>
    );
  }

  return (
    <div className="cineaura-loader__inline">
      <div className="cineaura-loader__ring cineaura-loader__ring--medium"></div>
    </div>
  );
};

export default CineAuraLoader;
