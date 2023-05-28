const TableFooter = ({ pagination, pageCount }) => {
    return(
      <>
      <button
        type="button"
        disabled={pagination.state.page === 0}
        onClick={() => pagination.fns.onSetPage(0)}
      >
        {"<<"}
      </button>
      <button
        type="button"
        disabled={pagination.state.page === 0}
        onClick={() =>
          pagination.fns.onSetPage(pagination.state.page - 1)
        }
      >
        {"<"}
      </button>
      <button
        type="button"
        disabled={pagination.state.page + 1 === pageCount}
        onClick={() =>
          pagination.fns.onSetPage(pagination.state.page + 1)
        }
      >
        {">"}
      </button>
      <button
        type="button"
        disabled={pagination.state.page + 1 === pageCount}
        onClick={() =>
          pagination.fns.onSetPage(pageCount - 1)
        }
      >
        {">>"}
      </button>
      </>
    );
}

export default TableFooter;