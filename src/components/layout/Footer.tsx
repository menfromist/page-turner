export function Footer() {
  return (
    <footer className="border-t bg-gray-50 py-8 mt-auto">
      <div className="container mx-auto px-4 text-center text-gray-600">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Page Turner. 함께 읽고, 함께 나누는 낭독 모임.
        </p>
      </div>
    </footer>
  );
}
