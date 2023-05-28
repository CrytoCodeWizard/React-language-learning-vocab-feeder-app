const TableSearch = ({ styles, handleSearch }) => {
    return (
      <>
        <div className={styles.searchWrapper}>
          <label htmlFor="search">
            <input id="search" type="text" placeholder="Enter a search term" onChange={handleSearch} />
          </label>
        </div>
      </>
    );
}

export default TableSearch;