import Box from "@mui/material/Box";
import {
  DataGridPremium,
  GridEditInputCell,
  useGridApiContext,
} from "@mui/x-data-grid-premium";
import moment from "moment";
import { isEmpty, noop } from "lodash";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { DatePicker, DateTimePicker } from "@mui/x-date-pickers";
import { styled } from "@mui/material/styles";
import InputBase from "@mui/material/InputBase";
import CustomNoRowsOverlay from "app/main/components/table/CustomNoRowsOverlay";
import { Tooltip, tooltipClasses } from "@mui/material";
import localeText from "app/main/components/localeText";
import { IMaskInput } from "react-imask";

const cols = [
  {
    headerName: "Name",
    field: "name",
    width: 160,
    type: "string",
    editable: true,
  },
  {
    headerName: "Age",
    field: "age",
    width: 160,
    type: "number",
    editable: true,
  },
  {
    headerName: "Date",
    field: "date",
    width: 160,
    type: "date",
    editable: true,
    valueFormatter: (params) => {
      return params.value !== null
        ? moment(params.value).format("DD/MM/YYYY")
        : "";
    },
  },
];

const GridEditDateInput = styled(InputBase)({
  fontSize: "inherit",
  padding: "0 9px",
});

export const GridEditDateCell = ({ id, field, value, colDef, ...other }) => {
  const apiRef = useGridApiContext();

  const Component = colDef.type === "dateTime" ? DateTimePicker : DatePicker;

  const handleChange = (newValue) => {
    apiRef.current.setEditCellValue({ id, field, value: newValue });
  };

  return (
    <Component
      value={value}
      {...other}
      renderInput={({ inputRef, inputProps, InputProps, disabled, error }) => (
        <GridEditDateInput
          fullWidth
          autoFocus
          ref={inputRef}
          {...InputProps}
          disabled={disabled}
          error={error}
          inputProps={inputProps}
        />
      )}
      onChange={handleChange}
    />
  );
};

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
  },
}));

export const GridEditInputValidateCell = (props) => {
  const { error } = props;

  return (
    <StyledTooltip open={!!error} title={error}>
      <GridEditInputCell {...props} />
    </StyledTooltip>
  );
};

const DataGridEditable = forwardRef((props, ref) => {
  const {
    apiRef,
    rows = [],
    setRows = noop,
    checked = [],
    setChecked = noop,
    getSelected = noop,
    apiRedux = noop,
    columns = cols,
    status = "Table",
    unique = "id",
    pageSize = 5,
    rowsPerPageOptions = [5, 10, 25, 50, 100],
    ...other
  } = props;

  useImperativeHandle(ref, () => ({
    handleChecked,
  }));

  const [upload, setUpload] = useState();

  const handleChecked = (e) => {
    return upload;
  };

  const handleCommit = (e, a) => {
    const changes = rows.map((em) => {
      if (em?.[unique] === e?.[unique]) {
        const { field } = e;
        let { value } = e;
        if (field === "date") {
          value = moment(value).format("YYYY/MM/DD");
        }

        return { ...em, [field]: value };
      }
      return { ...em };
    });

    setRows(changes);
  };

  const handleSelect = (e) => {
    const filtered = rows.filter((v) => {
      return e.includes(v?.[unique]);
    });
    setUpload(filtered);
    setChecked?.(e);
  };

  const processRowUpdate = (newRow) => {
    const changes = rows.map((em) => {
      if (em?.[unique] === newRow?.[unique]) {
        return newRow;
      }
      return { ...em };
    });

    setRows(changes);
    return newRow;
  };

  useEffect(() => {
    if (!isEmpty(upload)) {
      const filtered = rows.filter((v) => {
        return checked.includes(v?.[unique]);
      });

      setUpload(filtered);
    }
  }, [rows]);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ height: 350, width: "100%", mb: 1 }}>
        <DataGridPremium
          {...other}
          pageSize={pageSize}
          rowsPerPageOptions={rowsPerPageOptions}
          sx={{
            "& .MuiDataGrid-row": {
              "&:nth-of-type(2n)": { backgroundColor: "#F6F6F6" },
            },
            "&.MuiDataGrid-root--densityCompact .MuiDataGrid-cell": {
              py: "8px",
            },
            "&.MuiDataGrid-root--densityStandard .MuiDataGrid-cell": {
              py: "15px",
            },
            "&.MuiDataGrid-root--densityComfortable .MuiDataGrid-cell": {
              py: "22px",
            },
            "& .MuiDataGrid-virtualScrollerContent": isEmpty(rows)
              ? {
                  minHeight: "300px!important",
                }
              : {},
          }}
          localeText={localeText}
          rows={rows}
          columns={columns}
          onCellEditCommit={handleCommit}
          pagination
          checkboxSelection
          disableSelectionOnClick
          selectionModel={checked}
          onSelectionModelChange={handleSelect}
          getRowId={(e) => {
            return e?.[unique];
          }}
          components={{
            NoRowsOverlay: CustomNoRowsOverlay,
            NoResultsOverlay: CustomNoRowsOverlay,
          }}
          experimentalFeatures={{ newEditingApi: true }}
          processRowUpdate={processRowUpdate}
        />
      </Box>
    </Box>
  );
});

export default DataGridEditable;
