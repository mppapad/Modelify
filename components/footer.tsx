
export default function Footer() {
  return (
    <footer className="bg-gray-50 rounded-lg shadow m-4 dark:bg-[#181818] h-fit w-fit items-center justify-between flex ">
      <div className="flex flex-wrap items-center justify-between mx-auto p-4 self-center">
        <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
          Made with ❤️ by{" "}
          <a
            href="https://github.com/mppapad"
            target="_blank"
            className="hover:underline"
          >
            Miltiades
          </a>{" "}
          | 2025
        </span>
      </div>
    </footer>
  );
}
