import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UIState {
  isAddTransactionOpen: boolean;
  activeFilterType: "ALL" | "INCOME" | "EXPENSE";
  selectedTimeframe: "7D" | "30D" | "12M";
}

const initialState: UIState = {
  isAddTransactionOpen: false,
  activeFilterType: "ALL",
  selectedTimeframe: "12M",
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setAddTransactionOpen: (state, action: PayloadAction<boolean>) => {
      state.isAddTransactionOpen = action.payload;
    },
    setActiveFilterType: (state, action: PayloadAction<"ALL" | "INCOME" | "EXPENSE">) => {
      state.activeFilterType = action.payload;
    },
    setSelectedTimeframe: (state, action: PayloadAction<"7D" | "30D" | "12M">) => {
      state.selectedTimeframe = action.payload;
    },
  },
});

export const { setAddTransactionOpen, setActiveFilterType, setSelectedTimeframe } =
  uiSlice.actions;

export default uiSlice.reducer;

