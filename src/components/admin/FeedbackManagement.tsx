import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star, MessageSquare, Calendar } from "lucide-react";
import { format } from "date-fns";

interface Feedback {
  id: string;
  user_id: string;
  rating: number;
  feedback_text: string | null;
  created_at: string;
  updated_at: string;
}

const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalFeedback: 0,
    averageRating: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0,
  });
  const { toast } = useToast();

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFeedback((data || []) as any);

      // Calculate statistics
      const total = data?.length || 0;
      const avgRating = total > 0
        ? data.reduce((sum, f) => sum + f.rating, 0) / total
        : 0;
      
      const ratingCounts = {
        5: data?.filter(f => f.rating === 5).length || 0,
        4: data?.filter(f => f.rating === 4).length || 0,
        3: data?.filter(f => f.rating === 3).length || 0,
        2: data?.filter(f => f.rating === 2).length || 0,
        1: data?.filter(f => f.rating === 1).length || 0,
      };

      setStats({
        totalFeedback: total,
        averageRating: Math.round(avgRating * 10) / 10,
        fiveStars: ratingCounts[5],
        fourStars: ratingCounts[4],
        threeStars: ratingCounts[3],
        twoStars: ratingCounts[2],
        oneStar: ratingCounts[1],
      });
    } catch (error: any) {
      console.error('Error fetching feedback:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []);

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground"
            }`}
          />
        ))}
      </div>
    );
  };

  const getRatingBadgeVariant = (rating: number) => {
    if (rating >= 4) return "default";
    if (rating >= 3) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading feedback...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFeedback}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <div className="flex gap-1 mt-2">
              {renderStars(Math.round(stats.averageRating))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating Distribution</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>5⭐</span>
                <span className="font-semibold">{stats.fiveStars}</span>
              </div>
              <div className="flex justify-between">
                <span>4⭐</span>
                <span className="font-semibold">{stats.fourStars}</span>
              </div>
              <div className="flex justify-between">
                <span>3⭐</span>
                <span className="font-semibold">{stats.threeStars}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Ratings</CardTitle>
            <Star className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>2⭐</span>
                <span className="font-semibold text-destructive">{stats.twoStars}</span>
              </div>
              <div className="flex justify-between">
                <span>1⭐</span>
                <span className="font-semibold text-destructive">{stats.oneStar}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            User Feedback & Ratings
          </CardTitle>
          <CardDescription>
            View all user feedback and ratings submitted through the app
          </CardDescription>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No feedback received yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>User ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedback.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {format(new Date(item.created_at), "MMM dd, yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(item.created_at), "HH:mm")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {renderStars(item.rating)}
                        <Badge variant={getRatingBadgeVariant(item.rating) as any} className="w-fit">
                          {item.rating}/5
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      {item.feedback_text ? (
                        <p className="text-sm">{item.feedback_text}</p>
                      ) : (
                        <span className="text-muted-foreground italic">No comment</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {item.user_id.substring(0, 8)}...
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackManagement;
