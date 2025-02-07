import { t } from 'fyo';
import { RawValueMap } from 'fyo/core/types';
import { Action } from 'fyo/model/types';
import getCommonExportActions from 'reports/commonExporter';
import { ColumnField, ReportData } from 'reports/types';
import { Field } from 'schemas/types';
import { getStockBalanceEntries } from './helpers';
import { StockLedger } from './StockLedger';
import { ReferenceType } from './types';

export class StockBalance extends StockLedger {
  static title = t`Stock Balance`;
  static reportName = 'stock-balance';
  static isInventory = true;

  override ascending = true;
  override referenceType: ReferenceType = 'All';
  override referenceName = '';

  override async _getReportData(force?: boolean): Promise<ReportData> {
    if (this.shouldRefresh || force || !this._rawData?.length) {
      await this._setRawData();
    }

    const filters = {
      item: this.item,
      location: this.location,
      batch: this.batch,
      fromDate: this.fromDate,
      toDate: this.toDate,
    };

    const rawData = getStockBalanceEntries(this._rawData ?? [], filters);

    return rawData.map((sbe, i) => {
      const row = { ...sbe, name: i + 1 } as RawValueMap;
      return this._convertRawDataRowToReportRow(row, {
        incomingQuantity: 'green',
        outgoingQuantity: 'red',
        balanceQuantity: null,
      });
    });
  }

  getFilters(): Field[] {
    const filters = [
      {
        fieldtype: 'Link',
        target: 'Item',
        placeholder: t`Item`,
        label: t`Item`,
        fieldname: 'item',
      },
      {
        fieldtype: 'Link',
        target: 'Location',
        placeholder: t`Location`,
        label: t`Location`,
        fieldname: 'location',
      },
      ...(this.hasBatches
        ? [
            {
              fieldtype: 'Link',
              target: 'Batch',
              placeholder: t`Batch`,
              label: t`Batch`,
              fieldname: 'batch',
            },
          ]
        : []),
      {
        fieldtype: 'Date',
        placeholder: t`From Date`,
        label: t`From Date`,
        fieldname: 'fromDate',
      },
      {
        fieldtype: 'Date',
        placeholder: t`To Date`,
        label: t`To Date`,
        fieldname: 'toDate',
      },
    ] as Field[];

    return filters;
  }

  getColumns(): ColumnField[] {
    return [
      {
        fieldname: 'name',
        label: '#',
        fieldtype: 'Int',
        width: 0.5,
      },
      {
        fieldname: 'item',
        label: t`Item`,
        fieldtype: 'Link',
      },
      {
        fieldname: 'location',
        label: t`Location`,
        fieldtype: 'Link',
      },
      ...(this.hasBatches
        ? ([
            { fieldname: 'batch', label: t`Batch`, fieldtype: 'Link' },
          ] as ColumnField[])
        : []),
      {
        fieldname: 'balanceQuantity',
        label: t`Balance Qty.`,
        fieldtype: 'Float',
      },
      {
        fieldname: 'balanceValue',
        label: t`Balance Value`,
        fieldtype: 'Float',
      },
      {
        fieldname: 'openingQuantity',
        label: t`Opening Qty.`,
        fieldtype: 'Float',
      },
      {
        fieldname: 'openingValue',
        label: t`Opening Value`,
        fieldtype: 'Float',
      },
      {
        fieldname: 'incomingQuantity',
        label: t`In Qty.`,
        fieldtype: 'Float',
      },
      {
        fieldname: 'incomingValue',
        label: t`In Value`,
        fieldtype: 'Currency',
      },
      {
        fieldname: 'outgoingQuantity',
        label: t`Out Qty.`,
        fieldtype: 'Float',
      },
      {
        fieldname: 'outgoingValue',
        label: t`Out Value`,
        fieldtype: 'Currency',
      },
      {
        fieldname: 'valuationRate',
        label: t`Valuation Rate`,
        fieldtype: 'Currency',
      },
    ];
  }

  getActions(): Action[] {
    return getCommonExportActions(this);
  }
}
