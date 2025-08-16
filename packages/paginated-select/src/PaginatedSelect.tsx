"use client";

import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { Select, Spin } from "antd";
import type { SelectProps } from "antd";
import { useQuery } from "@tanstack/react-query";

/** ===================== Base Types ===================== */
type OptionType = { label: string; value: string };

type ValueType<M extends boolean> = M extends true ? string[] : string;
type OnChangeType<M extends boolean> = M extends true
  ? (value: string[], option?: OptionType | OptionType[]) => void
  : (value: string, option?: OptionType) => void;

export type ListArgs = {
  page: number;
  pageSize: number;
  search?: string;
  params?: Record<string, any>;
};

export type ListResponse<T> =
  | { items: T[]; total: number }
  | { items: T[]; hasMore: boolean };

export type DataAdapter<T> = {
  list: (args: ListArgs) => Promise<ListResponse<T>>;
  getById?: (id: string) => Promise<T | null>;
  getByIds?: (ids: string[]) => Promise<T[]>;
  getLabel: (item: T) => string;
  getValue: (item: T) => string;
};

// Optional helper to maintain strong type inference when defining adapters
export const makeAdapter =
  <T,>() =>
  <A extends DataAdapter<T>>(a: A) =>
    a;

/** ===================== Props inferred from adapter ===================== */
export type PaginatedSelectProps<
  A extends DataAdapter<any>,
  M extends boolean = false
> = Omit<
  SelectProps<ValueType<M>>,
  "options" | "onPopupScroll" | "onSearch" | "onChange" | "filterOption"
> & {
  dataAdapter: A;
  multiple?: M;
  pageSize?: number;
  params?: Record<string, any>;
  dependencyKey?: unknown;
  placeholder?: string;
  disabled?: boolean;
  value?: ValueType<M>;
  onChange?: OnChangeType<M>;
  debug?: boolean;
};

/** ===================== Component ===================== */
export default function PaginatedSelect<
  A extends DataAdapter<any>,
  M extends boolean = false
>({
  dataAdapter,
  pageSize = 10,
  params,
  dependencyKey,
  placeholder,
  disabled = false,
  value,
  onChange,
  multiple = false as M,
  debug = false,
  ...restProps
}: PaginatedSelectProps<A, M>) {
  const ITEM_HEIGHT = 32;
  const VISIBLE = pageSize; // how many items should be "visible"
  const LIST_HEIGHT = ITEM_HEIGHT * VISIBLE - 8; // force overflow (~1/4 item)
  // T inferred from adapter
  type T = A extends DataAdapter<infer X> ? X : never;

  const ns = useRef(Math.random().toString(36).slice(2, 7));
  const log = useCallback(
    (...a: unknown[]) => debug && console.log(`[PS:${ns.current}]`, ...a),
    [debug]
  );

  // state/pagination
  const [data, setData] = useState<OptionType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const isPagingRef = useRef(false);

  // search debounce
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // reset when dependencyKey changes
  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setFetching(false);
    isPagingRef.current = false;
  }, [dependencyKey]);

  // helpers
  const getValuesArray = useCallback(
    (val: string | string[] | undefined): string[] =>
      !val ? [] : Array.isArray(val) ? val : [val],
    []
  );

  const valuesArray = useMemo(
    () => getValuesArray(value),
    [value, getValuesArray]
  );
  const selectedSet = useMemo(() => new Set(valuesArray), [valuesArray]);

  // selected values that don't have labels in options yet
  const missingValues = useMemo(
    () => valuesArray.filter((v) => !data.some((o) => o.value === v)),
    [valuesArray, data]
  );

  // fetch by ID(s) to inject labels for already selected values
  const { data: itemsById, isLoading: loadingItemById } = useQuery({
    queryKey: ["ps-byId", ns.current, missingValues, dependencyKey],
    queryFn: async () => {
      if (missingValues.length === 0) return [];

      // try bulk fetch first
      if (dataAdapter.getByIds && missingValues.length > 1) {
        try {
          const items = await dataAdapter.getByIds(missingValues);
          const map = new Map(
            items.map((it) => [dataAdapter.getValue(it as T), it as T])
          );
          return missingValues.map((id) => ({ id, item: map.get(id) ?? null }));
        } catch {
          return missingValues.map((id) => ({ id, item: null }));
        }
      }

      // fallback: one by one
      if (!dataAdapter.getById) return [];
      const res = await Promise.all(
        missingValues.map(async (id) => {
          try {
            const item = await dataAdapter.getById!(id);
            return { id, item: (item ?? null) as T | null };
          } catch {
            return { id, item: null as T | null };
          }
        })
      );
      return res;
    },
    enabled:
      (!!dataAdapter.getById || !!dataAdapter.getByIds) &&
      missingValues.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  // inject options from getById(s)
  useEffect(() => {
    if (!itemsById || itemsById.length === 0) return;
    setData((prev) => {
      const next = [...prev];
      const seen = new Set(prev.map((o) => o.value));
      let injected = 0;
      for (const { id, item } of itemsById as Array<{
        id: string;
        item: T | null;
      }>) {
        if (!item || !id || seen.has(id)) continue;
        next.unshift({ value: id, label: dataAdapter.getLabel(item) });
        seen.add(id);
        injected++;
      }
      log("injected-by-id", { injected, total: next.length });
      return next;
    });
  }, [itemsById, dataAdapter, log]);

  // load data for a page
  const loadData = useCallback(
    async (pageNumber: number, search?: string) => {
      if (fetching) {
        log("loadData skip: fetching");
        return;
      }
      setFetching(true);
      try {
        const res = await dataAdapter.list({
          page: pageNumber,
          pageSize,
          search,
          params,
        });

        const items = res.items ?? [];
        const nextHasMore =
          "hasMore" in res
            ? res.hasMore
            : "total" in res
            ? pageNumber * pageSize < (res.total ?? items.length)
            : false;

        const mapped: OptionType[] = items.map((it: T) => ({
          value: dataAdapter.getValue(it),
          label: dataAdapter.getLabel(it),
        }));

        setData((prev) => {
          // preserve selected items when reloading page 1
          const preserved =
            pageNumber === 1
              ? prev.filter((o) => selectedSet.has(o.value))
              : [];
          const base = pageNumber === 1 ? mapped : [...prev, ...mapped];
          const merged = pageNumber === 1 ? [...preserved, ...base] : base;

          // dedupe by value
          const seen = new Set<string>();
          const out: OptionType[] = [];
          for (const it of merged) {
            if (!seen.has(it.value)) {
              seen.add(it.value);
              out.push(it);
            }
          }
          return out;
        });

        setHasMore(nextHasMore);
      } catch (e) {
        log("loadData error", e);
        setHasMore(false);
      } finally {
        setFetching(false);
        isPagingRef.current = false;
      }
    },
    [dataAdapter, pageSize, params, selectedSet, log]
  );

  // kickoff (resets when search/dependency/params change)
  const lastKickoffKeyRef = useRef<string | null>(null);
  useEffect(() => {
    const key = `${dependencyKey ?? ""}|${
      JSON.stringify(params) ?? ""
    }|${debouncedSearchTerm}`;
    if (lastKickoffKeyRef.current === key) return;
    lastKickoffKeyRef.current = key;

    setPage(1);
    setHasMore(true);
    isPagingRef.current = true;
    loadData(1, debouncedSearchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, dependencyKey, params]);

  // infinite scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.target as HTMLDivElement;
      const atBottom = el.scrollTop + el.offsetHeight >= el.scrollHeight - 10;
      if (atBottom && hasMore && !fetching && !isPagingRef.current) {
        isPagingRef.current = true;
        setPage((p) => p + 1);
      }
    },
    [hasMore, fetching]
  );

  // load pages > 1
  useEffect(() => {
    if (page > 1 && hasMore) {
      loadData(page, debouncedSearchTerm);
    }
  }, [page, hasMore, debouncedSearchTerm, loadData]);

  // server-side search
  const handleSearch = useCallback((term: string) => {
    setSearchTerm((prev) => (prev === term ? prev : term));
  }, []);

  // check if all selected items have labels
  const hasAllLabels = useMemo(() => {
    if (!value) return true;
    return valuesArray.every((v) =>
      data.some((o) => o.value === v && o.label && o.label !== v)
    );
  }, [value, valuesArray, data]);

  // ensure only values with labels are shown
  const effectiveValue = useMemo(() => {
    if (!value) return undefined;
    if (hasAllLabels) return value;

    if (multiple) {
      const valsWithLabels = valuesArray.filter((v) =>
        data.some((o) => o.value === v && o.label && o.label !== v)
      );
      return valsWithLabels.length > 0 ? valsWithLabels : undefined;
    }
    return undefined;
  }, [value, hasAllLabels, multiple, valuesArray, data]);

  return (
    <Select
      {...restProps}
      mode={multiple ? "multiple" : undefined}
      value={effectiveValue as ValueType<M>}
      onChange={
        onChange as (
          value: ValueType<M>,
          option?: OptionType | OptionType[]
        ) => void
      }
      showSearch
      style={{ width: "100%" }}
      listHeight={LIST_HEIGHT}
      options={data}
      onPopupScroll={handleScroll}
      onSearch={handleSearch}
      placeholder={placeholder}
      disabled={disabled}
      filterOption={false}
      notFoundContent={
        fetching || loadingItemById ? <Spin size="small" /> : "No results found"
      }
      loading={fetching || loadingItemById}
    />
  );
}
