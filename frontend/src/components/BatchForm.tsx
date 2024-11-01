'use client';

import {useRouter} from 'next/navigation';
import {useForm} from 'react-hook-form';
import {gql, useMutation} from '@apollo/client';
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';

const UPDATE_MUTATION = gql`
  mutation UpdateBatch($id: Int!, $input: UpdateBatchInput!) {
    updateBatch(id: $id, input: $input) {
      id
    }
  }
`;

interface EditBatchInput {
  numBars: number;
}
export function BatchForm({batch}) {
  const router = useRouter();
  const form = useForm<EditBatchInput>({
    defaultValues: batch,
  });
  const [update, unused2] = useMutation(UPDATE_MUTATION, {
    onCompleted: () => {
      router.push('/');
    },
  });

  const onSubmit = data => {
    update({
      variables: {
        id: batch.id,
        input: {
          numBars: data.numBars,
        },
      },
    });
  };

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
      <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
        <Card x-chunk="dashboard-07-chunk-0">
          <CardHeader>
            <CardTitle>Edit Batch Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="numBars">Num Bars</Label>
                    <Input
                      type="number"
                      name="numBars"
                      step="1"
                      className="w-full"
                      {...form.register('numBars', {
                        valueAsNumber: true,
                      })}
                    />
                  </div>
                  <Button type="submit">Update</Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return <div>{JSON.stringify(batch)}</div>;
}
