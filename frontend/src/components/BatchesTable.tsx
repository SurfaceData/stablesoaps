'use client';

import {gql, useSuspenseQuery, useMutation} from '@apollo/client';
import {ColumnDef} from '@tanstack/react-table';
import Link from 'next/link';
import {MoreHorizontal} from 'lucide-react';

import {DataTable} from '@/components/DataTable';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const QUERY = gql`
  query Batches {
    batches {
      id
      createDate
      amount
      numBars
      status
      labelStatus
      recipe {
        name
        lye {
          quantity
          ingredient {
            costPerUnit
          }
        }
        baseOils {
          quantity
          ingredient {
            costPerUnit
          }
        }
        essentialOils {
          quantity
          ingredient {
            costPerUnit
          }
        }
      }
    }
  }
`;

const UPDATE_LABEL_STATUS = gql`
  mutation UpdateBatchLabelStatus($id: Int!, $labelStatus: String!) {
    updateBatchLabelStatus(id: $id, labelStatus: $labelStatus) {
      id
      labelStatus
    }
  }
`;

const UPDATE_STATUS = gql`
  mutation UpdateBatchStatus($id: Int!, $status: String!) {
    updateBatchStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

const LABEL_STATUS_OPTIONS = {
  preparing: 'generated',
  generated: 'printed',
  printed: 'done',
};

const STATUS_OPTIONS = {
  preparing: 'curing',
  curing: 'wrapped',
  wrapped: 'done',
};

export const columns: ColumnDef[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'recipe.name',
    header: 'Recipe Name',
  },
  {
    accessorKey: 'createDate',
    header: 'Create Date',
  },
  {
    accessorKey: 'amount',
    header: 'Amount (g)',
  },
  {
    accessorKey: 'costPerBar',
    header: 'Cost Per Bar ($)',
  },
  {
    accessorKey: 'numBars',
    header: 'Num Bars',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'labelStatus',
    header: 'Label Status',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({row}) => {
      const batch = row.original;
      const [updateLabelStatus, unused1] = useMutation(UPDATE_LABEL_STATUS, {
        refetchQueries: [QUERY],
      });
      const [updateStatus, unused2] = useMutation(UPDATE_STATUS, {
        refetchQueries: [QUERY],
      });

      const setLabelStatus = () => {
        updateLabelStatus({
          variables: {
            id: batch.id,
            labelStatus: LABEL_STATUS_OPTIONS[batch.labelStatus],
          },
        });
      };
      const setStatus = () => {
        updateStatus({
          variables: {
            id: batch.id,
            status: STATUS_OPTIONS[batch.status],
          },
        });
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Update Label Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={setLabelStatus}>
              Set to {LABEL_STATUS_OPTIONS[batch.labelStatus]}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Update Status</DropdownMenuLabel>
            <DropdownMenuItem onClick={setStatus}>
              Set to {STATUS_OPTIONS[batch.status]}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Link href={`/admin/batch/${batch.id}`}>View</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/admin/batch/${batch.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function BatchesTable() {
  const {data} = useSuspenseQuery(QUERY);
  const costPer100 = recipe => {
    const {baseOils, essentialOils} = recipe;
    const baseCost = baseOils
      .map(({ingredient, quantity}) => quantity * ingredient.costPerUnit)
      .reduce((acc, cost) => acc + cost, 0.0);
    const essentialCost = essentialOils
      .map(({ingredient, quantity}) => quantity * ingredient.costPerUnit)
      .reduce((acc, cost) => acc + cost, 0.0);
    return baseCost + essentialCost;
  };
  const costPerBatch = batch => {
    return (costPer100(batch.recipe) * batch.amount) / 100 / batch.numBars;
  };
  const batches = data.batches.map(batch => ({
    ...batch,
    costPerBar: costPerBatch(batch).toFixed(2),
  }));

  return (
    <Card x-chunk="dashboard-05-chunk-3">
      <CardHeader className="px-7">
        <CardTitle>Batches</CardTitle>
        <CardDescription className="flex justify-between">
          <Link href="/admin/batch">
            <Button>New Batch</Button>
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DataTable columns={columns} data={batches} />
      </CardContent>
    </Card>
  );
}
