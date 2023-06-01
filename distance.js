export const distance = (c1, c2) =>
  Math.abs(
    c2.red() - c1.red() + c2.green() - c1.green() + c2.blue() - c1.blue()
  );
