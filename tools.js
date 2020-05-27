Object.defineProperty(HTMLTableCellElement.prototype, "rowIndex", {
  get() {
    return this.parentElement.rowIndex;
  },
});
