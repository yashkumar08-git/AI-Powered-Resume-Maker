export function Footer() {
  return (
    <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t mt-auto">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Resume Maker. All rights reserved.</p>
      </div>
    </footer>
  );
}
