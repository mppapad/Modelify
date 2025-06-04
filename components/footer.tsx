export default function Footer() {
  return (
    <footer className="bg-card border rounded-lg shadow m-4 h-fit w-fit items-center justify-between flex">
      <div className="flex flex-wrap items-center justify-between mx-auto p-4 self-center">
        <span className="text-sm text-muted-foreground sm:text-center">
          Made with ❤️ by{" "}
          <a
            href="https://github.com/mppapad"
            target="_blank"
            className="hover:underline text-foreground transition-colors"
            rel="noreferrer"
          >
            Miltiades
          </a>{" "}
          | 2025
        </span>
      </div>
    </footer>
  );
}
