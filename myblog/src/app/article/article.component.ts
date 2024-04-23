import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BlogPost } from '../blog-post/blog-post.component'; // Import the BlogPost interface or model

@Component({
  selector: 'app-article',
  templateUrl: './article.component.html',
  styleUrls: ['./article.component.css']
})
export class ArticleComponent implements OnInit {
  article: BlogPost | undefined; // Define article property to hold the blog post data

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id !== null && !isNaN(Number(id))) { // Check if id is not null and is a valid number
      const postId = Number(id);
      this.article = this.getBlogPostById(postId); // Fetch the blog post data based on the ID
    }
  }

  // Function to fetch the blog post data based on ID (Replace this with your actual logic)
  getBlogPostById(id: number): BlogPost | undefined {
    // Assuming blog post data is available in an array
    const blogPosts: BlogPost[] = [
      {
        id: 1, title: 'Sample Article', date: 'April 1, 2024',
        description: '',
        content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, minus quae ut distinctio at excepturi ex magni fugit provident quasi, repellendus perferendis explicabo eaque magnam ratione veritatis illum harum a aut unde dicta dolor alias iste autem. Quibusdam tenetur at quam explicabo, minima dolorem. Unde ea aperiam quaerat iste. Atque at labore qui nobis fugit sed necessitatibus id eos quibusdam eligendi. Cupiditate illum minus distinctio nihil veritatis. Molestiae fuga nesciunt non ullam, cumque minima corporis a atque beatae aspernatur pariatur impedit, vel cum omnis odit? Nesciunt provident ex assumenda exercitationem fugiat, tempore minima quas dicta non. Aliquam necessitatibus soluta repellendus doloremque rem. Veniam, sapiente maxime eum adipisci nihil beatae. Sed voluptatum hic ipsum voluptate quisquam quidem quis iusto beatae adipisci sapiente fugit quaerat eos, at vero natus perspiciatis cum corporis officiis ad recusandae accusantium. Deleniti esse sint labore asperiores expedita repellat quam magni nam aliquam est eaque facere at harum, eveniet quibusdam sed debitis minima laborum alias. Molestiae nobis, quo aliquid error placeat enim dolorem earum officia nisi pariatur soluta dolor expedita aspernatur totam nihil alias sed quis adipisci natus deserunt dolorum cum. Enim tempora alias, quia eos molestiae impedit ad laudantium numquam et perferendis accusantium officia aliquid voluptatem, praesentium, similique odio animi quas! Reprehenderit iste animi recusandae dolorum, minima praesentium ex, odio aspernatur et ipsum cum non corrupti dolor commodi? Earum ut vel a dolorum veritatis sint aut unde. Nam tempore cumque maxime odit tenetur harum veritatis perferendis recusandae dolorem! Officia tempore impedit dignissimos temporibus nobis aspernatur iste necessitatibus, quos aperiam illum provident suscipit dolore, et, praesentium ea facilis minima natus illo saepe consequatur. Consequatur, corporis. Nulla magnam earum iusto? Fuga facilis libero aliquam dolores, suscipit molestias id voluptas ipsam beatae sint quo ex dicta laudantium, repudiandae quibusdam odio alias voluptatibus nihil eligendi explicabo in! Obcaecati exercitationem eveniet error architecto nesciunt molestias perspiciatis inventore officia debitis nam. Ipsa repudiandae doloribus quas quasi aut, delectus culpa cumque autem similique sint quae iste. Facere reiciendis dolore quibusdam similique. Officiis suscipit laboriosam ex doloremque provident? Quod, eum! Atque nobis aut dolores autem, ad distinctio reiciendis maiores voluptas nam reprehenderit non laboriosam, obcaecati sequi unde eveniet asperiores. Maiores harum asperiores praesentium aliquam recusandae? Voluptatem nesciunt ratione et accusamus, quas quaerat, magni rerum quibusdam error perferendis, soluta laudantium ipsa quidem. Cum aut nulla odio quaerat ea minima officia tempora quos, deleniti harum repellendus quis est unde voluptatum provident mollitia quod, sed, quam delectus aperiam in ipsa ex! Dicta quaerat natus libero at non dolor ad sequi quibusdam eaque, tempore facilis laudantium voluptates qui asperiores culpa rem. Vitae nihil magnam quos tenetur, consequuntur porro magni saepe similique voluptate quod exercitationem odio vero perferendis, illum reprehenderit laudantium! Provident deleniti ipsam sapiente explicabo dolor aliquid, iusto ducimus quibusdam a harum, numquam, suscipit sunt ipsum dicta assumenda nulla odio velit excepturi perferendis nobis quas adipisci quod! Dolore placeat tempora tempore aliquid necessitatibus quos doloremque, deserunt at qui fuga ipsam officiis molestias? Corporis, esse veniam odio aut voluptatibus amet obcaecati dolorem nihil placeat possimus impedit nulla magni facere officia!'
      },
      // Add more blog posts as needed
    ];
    
    // Find the blog post with the matching ID
    return blogPosts.find(post => post.id === id);
  }
}
