import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, User } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_BLOG_POSTS, resolveBlogCover } from "@/data/blogCatalog";
import type { Tables } from "@/integrations/supabase/types";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Blog = () => {
  const { lang } = useLanguage();
  const [posts, setPosts] = useState<Tables<"blog_posts">[]>(DEFAULT_BLOG_POSTS);
  const [selectedPost, setSelectedPost] = useState<Tables<"blog_posts"> | null>(null);

  useEffect(() => {
    let active = true;
    supabase
      .from("blog_posts")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (!error && data && data.length > 0) {
          setPosts(data);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <section className="pt-28 pb-12 bg-gradient-warm border-b border-border/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-primary text-xs font-semibold tracking-widest uppercase mb-2">
            {lang === "ne" ? "वैदिक लेखहरू" : "Sacred Articles"}
          </p>
          <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
            {lang === "ne" ? "धर्म, संस्कार र ज्ञान" : "Vedic Wisdom Blog"}
          </h1>
          <p className="text-muted-foreground text-base">
            {lang === "ne"
              ? "नेपाली वैदिक परम्परा, मन्त्र र संस्कारसम्बन्धी संक्षिप्त लेखहरू।"
              : "Concise reflections on Vedic rituals, mantras, and Nepali heritage."}
          </p>
        </div>
      </section>

      <section className="py-14 flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => {
              const title = lang === "ne" ? post.title_ne : post.title_en;
              const excerpt = lang === "ne" ? post.excerpt_ne : post.excerpt_en;
              const category = lang === "ne" ? post.category_ne : post.category_en;
              const coverSrc = resolveBlogCover(post.image_url);

              return (
                <article
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="group bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/35 hover:shadow-elevated transition-all cursor-pointer flex flex-col"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={coverSrc}
                      alt={title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                        {category}
                      </span>
                      <h2 className="font-display text-lg font-bold text-foreground mt-2.5 mb-2 group-hover:text-primary transition-colors">
                        {title}
                      </h2>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{excerpt}</p>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" /> {post.author}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {post.read_time}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <Dialog open={Boolean(selectedPost)} onOpenChange={(o) => !o && setSelectedPost(null)}>
        <DialogContent className="sm:max-w-xl max-h-[88vh] overflow-y-auto">
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-2xl leading-snug text-left">
                  {lang === "ne" ? selectedPost.title_ne : selectedPost.title_en}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-3 text-xs pt-1">
                  <span>{selectedPost.author}</span>
                  <span>·</span>
                  <span>{selectedPost.read_time}</span>
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2 text-sm sm:text-base text-foreground leading-relaxed">
                <img
                  src={resolveBlogCover(selectedPost.image_url)}
                  alt=""
                  className="w-full h-52 object-cover rounded-xl border border-border"
                />
                <p className="font-medium text-foreground">
                  {lang === "ne" ? selectedPost.excerpt_ne : selectedPost.excerpt_en}
                </p>
                {(lang === "ne" ? selectedPost.content_ne : selectedPost.content_en) && (
                  <div className="space-y-3 text-muted-foreground whitespace-pre-line">
                    {lang === "ne" ? selectedPost.content_ne : selectedPost.content_en}
                  </div>
                )}
                <div className="pt-3 border-t border-border flex flex-wrap gap-4 text-sm">
                  <Link to="/ask-pandit" className="text-primary font-semibold hover:underline">
                    {lang === "ne" ? "AI पण्डितलाई सोध्नुहोस् →" : "Ask AI Pandit →"}
                  </Link>
                  <Link to="/services#booking" className="text-primary font-semibold hover:underline">
                    {lang === "ne" ? "पूजा बुक गर्नुहोस् →" : "Book a Ceremony →"}
                  </Link>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Blog;
