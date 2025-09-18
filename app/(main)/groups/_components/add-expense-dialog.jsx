"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Loader2, Receipt, Users, DollarSign } from "lucide-react";
import { createGroupExpense } from "@/actions/expenses";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { defaultCategories } from "@/data/categories";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.string().min(1, "Amount is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  date: z.string().min(1, "Date is required"),
  splitType: z.enum(["EQUAL", "EXACT", "PERCENTAGE"]),
  paidBy: z.string().min(1, "Please select who paid"),
  participants: z.array(z.string()).min(1, "Select at least one participant"),
});

export function AddExpenseDialog({ groupId, members, anonymousMembers = [] }) {
  const [open, setOpen] = useState(false);

  // Combine all members (registered + anonymous)
  const allMembers = [
    ...members.map((m) => ({
      id: `user_${m.user.id}`,
      name: m.user.name || m.user.email,
      email: m.user.email,
      imageUrl: m.user.imageUrl,
      type: "user",
    })),
    ...anonymousMembers.map((m) => ({
      id: `anon_${m.id}`,
      name: m.name,
      email: m.email,
      imageUrl: null,
      type: "anonymous",
    })),
  ];

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      amount: "",
      category: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      splitType: "EQUAL",
      paidBy: "",
      participants: [],
    },
  });

  const watchedParticipants = form.watch("participants");
  const watchedSplitType = form.watch("splitType");

  const {
    loading: createLoading,
    fn: createExpenseFn,
    data: createdExpense,
  } = useFetch(createGroupExpense);

  const onSubmit = async (data) => {
    const expenseData = {
      ...data,
      groupId,
      amount: parseFloat(data.amount),
    };

    // Close dialog immediately for better UX
    setOpen(false);
    form.reset();

    // Show optimistic success message
    toast.success("Adding expense...");

    try {
      await createExpenseFn(expenseData);
      // Replace the optimistic message with confirmation
      toast.success("Expense added successfully!");
    } catch (error) {
      // Show error and optionally reopen dialog
      toast.error(error.message || "Failed to add expense");
      // Optionally reopen the dialog with the form data
      // setOpen(true);
      // form.reset(data);
    }
  };

  const toggleParticipant = (memberId) => {
    const current = form.getValues("participants");
    if (current.includes(memberId)) {
      form.setValue(
        "participants",
        current.filter((id) => id !== memberId)
      );
    } else {
      form.setValue("participants", [...current, memberId]);
    }
  };

  const selectAllParticipants = () => {
    form.setValue(
      "participants",
      allMembers.map((m) => m.id)
    );
  };

  const clearAllParticipants = () => {
    form.setValue("participants", []);
  };

  const expenseCategories = defaultCategories.filter(
    (cat) => cat.type === "EXPENSE"
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Add New Expense
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 max-h-[80vh] overflow-y-auto"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Dinner at Restaurant"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {expenseCategories.map((category) => (
                          <SelectItem
                            key={category.value}
                            value={category.value}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{category.emoji}</span>
                              {category.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="splitType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Split Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="How to split" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EQUAL">Equal Split</SelectItem>
                        <SelectItem value="EXACT">Exact Amounts</SelectItem>
                        <SelectItem value="PERCENTAGE">Percentage</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Who Paid Section */}
            <FormField
              control={form.control}
              name="paidBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Who Paid?
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select who paid for this expense" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {allMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage
                                src={member.imageUrl}
                                alt={member.name}
                              />
                              <AvatarFallback className="text-xs">
                                {member.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{member.name}</span>
                            {member.type === "anonymous" && (
                              <Badge variant="outline" className="text-xs">
                                Guest
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Participants Selection */}
            <FormField
              control={form.control}
              name="participants"
              render={() => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Who owes money for this expense?
                  </FormLabel>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={selectAllParticipants}
                      >
                        Select All
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearAllParticipants}
                      >
                        Clear All
                      </Button>
                      <Badge variant="secondary">
                        {watchedParticipants.length} selected
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
                      {allMembers.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md cursor-pointer"
                          onClick={() => toggleParticipant(member.id)}
                        >
                          <Checkbox
                            checked={watchedParticipants.includes(member.id)}
                            onChange={() => toggleParticipant(member.id)}
                          />
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={member.imageUrl}
                              alt={member.name}
                            />
                            <AvatarFallback className="text-xs">
                              {member.name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {member.name}
                              </span>
                              {member.type === "anonymous" && (
                                <Badge variant="outline" className="text-xs">
                                  Guest
                                </Badge>
                              )}
                            </div>
                            {member.email && (
                              <span className="text-xs text-muted-foreground">
                                {member.email}
                              </span>
                            )}
                          </div>
                          {watchedSplitType === "EQUAL" &&
                            watchedParticipants.includes(member.id) && (
                              <Badge variant="secondary" className="text-xs">
                                {form.watch("amount") &&
                                watchedParticipants.length > 0
                                  ? `$${(parseFloat(form.watch("amount")) / watchedParticipants.length).toFixed(2)}`
                                  : "$0.00"}
                              </Badge>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add some notes about this expense..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createLoading}>
                {createLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Expense
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
