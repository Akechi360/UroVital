'use client';

import { useState } from "react";
import payments from "@/lib/data/payments.json";
import Image from "next/image";

export default function PagosDirectosPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = payments.slice(startIndex, endIndex);
  const totalPages = Math.ceil(payments.length / itemsPerPage);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">💳 Pagos Directos</h1>

      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full border-collapse bg-white dark:bg-slate-900">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800 text-left text-sm font-medium">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Paciente</th>
              <th className="px-4 py-3">Afiliación</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Monto</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPayments.map((pago) => (
              <tr
                key={pago.id}
                className="border-b hover:bg-sky-50 dark:hover:bg-slate-800 transition-colors"
              >
                <td className="px-4 py-3 text-sm">{pago.id}</td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <Image
                    src={pago.paciente.avatar || '/avatars/default.png'}
                    alt={pago.paciente.nombre}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span>{pago.paciente.nombre}</span>
                </td>
                <td className="px-4 py-3">
                  {pago.afiliacion === "Tarjeta Saludable" ? (
                    <span className="bg-sky-500 text-white rounded-full px-2 py-1 text-xs">
                      Tarjeta Saludable
                    </span>
                  ) : (
                    <span className="bg-emerald-500 text-white rounded-full px-2 py-1 text-xs">
                      Fondo Espíritu Santo
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 flex items-center gap-2">
                  <Image
                    src={pago.doctor.avatar || '/avatars/default.png'}
                    alt={pago.doctor.nombre}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                  <span>{pago.doctor.nombre}</span>
                </td>
                <td className="px-4 py-3 text-sm">{pago.fecha}</td>
                <td className="px-4 py-3 text-sm font-semibold">${pago.monto}</td>
                <td className="px-4 py-3 text-sm">{pago.metodo}</td>
                <td className="px-4 py-3">
                  {pago.estado === "Pagado" && (
                    <span className="bg-green-500 text-white rounded-full px-2 py-1 text-xs">
                      Pagado
                    </span>
                  )}
                  {pago.estado === "Pendiente" && (
                    <span className="bg-gray-400 text-white rounded-full px-2 py-1 text-xs">
                      Pendiente
                    </span>
                  )}
                  {pago.estado === "Parcial" && (
                    <span className="bg-amber-500 text-white rounded-full px-2 py-1 text-xs">
                      Parcial
                    </span>
                  )}
                  {pago.estado === "Anulado" && (
                    <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                      Anulado
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">…</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
