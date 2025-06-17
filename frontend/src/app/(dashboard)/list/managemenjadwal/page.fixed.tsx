'use client';

import FormModal from "@/component/FormModal";
import Pagination from "@/component/Pagination";
import Table from "@/component/Table";
import TableSearch from "@/component/TableSearch";
import Image from "next/image";
import FilterButton from "@/component/FilterButton";
import SortButton from "@/component/SortButton";
import withAuth from "@/lib/withAuth";
import { useEffect, useState, useMemo } from "react";

// Import the original component
import ManagemenJadwalPage from "./page";

// Wrap the component with withAuth to restrict access to ADMIN and SUPERVISOR roles
export default withAuth(ManagemenJadwalPage, ['ADMIN', 'SUPERVISOR']);
