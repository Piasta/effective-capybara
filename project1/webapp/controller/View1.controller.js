sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/m/MessageToast",
        "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (Controller, Fragment, MessageToast, Filter, FilterOperator) => {
    "use strict";

    return Controller.extend("project1.controller.View1", {
        onInit() {
        },

        onEmployeePress: function (oEvent) {
            let oItem = oEvent.getParameter("listItem");
            let oContext = oItem.getBindingContext("Employees");
            let sPath = oContext.getPath();
            let sEmployeeID = this.getView().getModel("Employees").getProperty(sPath).ID;
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            oRouter.navTo("Detail", { employeeID: sEmployeeID });
        },

        onInputLiveChange: function (oEvent) {
            let oInput = oEvent.getSource(),
                sValue = oInput.getValue(),
                phonePattern = /^\d{3}-\d{3}-\d{3}$/;  // Format: 123-456-789
            emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // Format: example@domain.com

            if (oInput.getId() === this.createId("phoneInput")) {
                if (!phonePattern.test(sValue)) {
                    oInput.setValueState("Error");
                    oInput.setValueStateText("Niepoprawny format. Użyj formatu 123-456-789.");
                } else {
                    oInput.setValueState("None");
                }
            }

            if (oInput.getId() === this.createId("emailInput")) {
                if (!emailPattern.test(sValue)) {
                    oInput.setValueState("Error");
                    oInput.setValueStateText("Email jest nieprawidłowy.");
                } else {
                    oInput.setValueState("None");
                }
            }
        },

        onAddEmployee: function () {
            let oView = this.getView();

            if (!this.pDialog) {
                this.pDialog = Fragment.load({
                    id: oView.getId(),
                    name: "project1.view.fragment.AddEmployee",
                    controller: this
                }).then(function (oDialog) {
                    oView.addDependent(oDialog);
                    return oDialog;
                });
            }

            this.pDialog.then(function (oDialog) {
                oDialog.open();
            });
        },

        onSaveEmployee: function () {
            let oView = this.getView(),
                oModel = oView.getModel('Employees'),
                aEmployees = oModel.getData().Employees;

            let sFirstName = oView.byId("firstNameInput").getValue(),
                sLastName = oView.byId("lastNameInput").getValue(),
                sPosition = oView.byId("positionInput").getValue(),
                sEmail = oView.byId("emailInput").getValue(),
                sPhone = oView.byId("phoneInput").getValue();

            if (!sFirstName || !sLastName || !sPosition) {
                MessageToast.show("Wypełnij wymagane pola.");
                return;
            }

            let newEmployee = {
                "ID": (aEmployees.length + 1).toString(),
                "FirstName": sFirstName,
                "LastName": sLastName,
                "Position": sPosition,
                "Email": sEmail,
                "Phone": sPhone,
                "Description": "Nowy pracownik."
            };

            aEmployees.push(newEmployee);
            oModel.setProperty("/Employees", aEmployees);

            MessageToast.show("Pracownik dodany!");
            this._clearForm();
            this.onCancelEmployee();
        },

        onCancelEmployee: function () {
            this.pDialog.then(function (oDialog) {
                oDialog.close();
            });
            this._clearForm();
        },

        _clearForm: function () {
            let oView = this.getView(),
                aInputs = [
                    "firstNameInput",
                    "lastNameInput",
                    "positionInput",
                    "emailInput",
                    "phoneInput"
                ];

            aInputs.forEach(function (sInputId) {
                let oInput = oView.byId(sInputId);
                if (oInput) {
                    oInput.setValue("");
                    oInput.setValueState("None");
                }
            });
        },

        onDeleteEmployee: function () {
            let oTable = this.getView().byId("table"),
                aSelectedItems = oTable.getSelectedItems(); // Zwraca tablicę zaznaczonych elementów

            // Pobieramy model z listą użytkowników
            let oModel = this.getView().getModel("Employees");
            let aEmployees = oModel.getProperty("/Employees");

            // Usuwamy użytkowników na podstawie zaznaczonego indeksu
            aSelectedItems.forEach(function (oItem) {
                let oContext = oItem.getBindingContext("Employees");
                let sEmployeeID = oContext.getProperty("ID"); // Pobieramy ID użytkownika
                let iIndex = aEmployees.findIndex(emp => emp.ID === sEmployeeID);
                if (iIndex !== -1) {
                    aEmployees.splice(iIndex, 1); // Usuwamy pracownika
                }
            });

            // aktualizujemy model
            oModel.setProperty("/Employees", aEmployees);

            // Wyczyść wybór w tabeli
            oTable.removeSelections(true);

            this.getView().byId("removeEmployeeBtn").setEnabled(false);

            MessageToast.show("Usunięto pracownika.");
        },

        onItemSelected: function () {
            let oTable = this.getView().byId("table"),
                oRemoveButton = this.getView().byId("removeEmployeeBtn"),
                aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length > 0) {
                oRemoveButton.setEnabled(true);
            } else {
                oRemoveButton.setEnabled(false);
            }
        },

        onFilterChange: function () {
            let oView = this.getView(),
                oTable = oView.byId("table"),
                sName = oView.byId("idNameInput").getValue(),
                sLastName = oView.byId("idLastNameInput").getValue(),
                sPosition = oView.byId("idPositionInput").getValue(),
                aFilters = [];

            // Tworzenie filtrów na podstawie wartości wprowadzonych przez użytkownika
            if (sName) {
                aFilters.push(new Filter("FirstName", FilterOperator.Contains, sName));
            }

            if (sLastName) {
                aFilters.push(new Filter("LastName", FilterOperator.Contains, sLastName));
            }

            if (sPosition) {
                aFilters.push(new Filter("Position", FilterOperator.Contains, sPosition));
            }

            let oBinding = oTable.getBinding("items");

            if (oBinding) {
                oBinding.filter(aFilters);
            }
        }

    });
});