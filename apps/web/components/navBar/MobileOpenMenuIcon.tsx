type Props = {
  onClick?: () => void;
};

const MobileOpenMenuIcon = ({ onClick }: Props) => {
  return (
    <button
      aria-controls="navbar-default"
      aria-expanded="false"
      data-collapse-toggle="navbar-default"
      onClick={onClick}
      type="button"
      className={`
        flex size-5 items-center justify-center rounded-lg text-sm text-gray-500
        hover:bg-gray-100
        focus:ring-0 focus:ring-gray-200 focus:outline-hidden
        md:hidden
        dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600
      `}
    >
      <span className="sr-only">Open main menu</span>
      <svg
        aria-hidden="true"
        className="size-5"
        fill="none"
        viewBox="0 0 17 14"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M1 1h15M1 7h15M1 13h15"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </button>
  );
};

export default MobileOpenMenuIcon;
