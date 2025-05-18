
const DashboardLink = () => {
  return (
    <div className="mt-2 text-xs text-center text-gray-500">
      <a 
        href="/" 
        target="_blank" 
        className="underline hover:text-bookmark-purple"
        onClick={() => {
          if (window !== window.parent) {
            // If in an iframe, navigate the parent window
            window.parent.location.href = '/';
            return false;
          }
          return true;
        }}
      >
        Open Bookmarks Dashboard
      </a>
    </div>
  );
};

export default DashboardLink;
