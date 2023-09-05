const TableSearch = ({ styles, handleSearch, searchValue }) => {
  return (
    <>
      <div className={styles.searchWrapper}>
        <label htmlFor="search">
          <input
            id="search"
            type="text"
            placeholder="Enter a search term"
            onChange={handleSearch}
            value={searchValue}
          />
        </label>
      </div>
    </>
  );
};

export default TableSearch;
